import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { FolderItem, FileItem, SharedDocumentItem } from '../../types';
import { StorageService } from '../storage/storageService';

export class ArchiveService {
  // =================== FOLDERS ===================

  static async getFolders(
    userId: string,
    parentId: string | null = null,
    includeDeleted = false
  ): Promise<FolderItem[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'folders'),
        where('userId', '==', userId),
        where('parentId', '==', parentId),
        where('isDeleted', '==', includeDeleted)
      );
      const snap = await getDocs(q);
      const list: FolderItem[] = [];
      snap.forEach((d) => list.push({ ...(d.data() as FolderItem), id: d.id }));
      return list;
    } catch (err) {
      console.error('Error fetching folders from Firestore:', err);
      return [];
    }
  }

  static async getFolderById(folderId: string): Promise<FolderItem | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, 'folders', folderId));
      if (!snap.exists()) return null;
      return { ...(snap.data() as FolderItem), id: snap.id };
    } catch {
      return null;
    }
  }

  static async getAllUserFolders(userId: string): Promise<FolderItem[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'folders'),
        where('userId', '==', userId),
        where('isDeleted', '==', false)
      );
      const snap = await getDocs(q);
      const list: FolderItem[] = [];
      snap.forEach((d) => list.push({ ...(d.data() as FolderItem), id: d.id }));
      return list;
    } catch (err) {
      console.error('Error fetching all user folders:', err);
      return [];
    }
  }

  static async createFolder(params: {
    userId: string;
    name: string;
    parentId?: string | null;
    description?: string;
    color?: string;
  }): Promise<FolderItem> {
    if (!db) throw new Error('Database Firestore tidak terhubung.');

    const newFolderData = {
      userId: params.userId,
      name: params.name.trim(),
      parentId: params.parentId || null,
      description: params.description?.trim() || '',
      color: params.color || 'yellow',
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'folders'), newFolderData);
    return { ...newFolderData, id: docRef.id };
  }

  static async renameFolder(folderId: string, newName: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'folders', folderId), {
      name: newName.trim(),
      updatedAt: new Date().toISOString(),
    });
  }

  static async moveFolder(folderId: string, targetParentId: string | null): Promise<void> {
    if (!db) return;
    if (folderId === targetParentId) {
      throw new Error('Tidak bisa memindahkan folder ke dalam dirinya sendiri.');
    }
    await updateDoc(doc(db, 'folders', folderId), {
      parentId: targetParentId,
      updatedAt: new Date().toISOString(),
    });
  }

  static async toggleFavoriteFolder(folderId: string, currentStatus?: boolean): Promise<void> {
    if (!db) return;
    let nextStatus = !currentStatus;
    if (currentStatus === undefined) {
      const snap = await getDoc(doc(db, 'folders', folderId));
      nextStatus = snap.exists() ? !Boolean(snap.data()?.isFavorite) : true;
    }
    await updateDoc(doc(db, 'folders', folderId), {
      isFavorite: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteFolder(folderId: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'folders', folderId), {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  static async restoreFolder(folderId: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'folders', folderId), {
      isDeleted: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    });
  }

  static async permanentlyDeleteFolder(folderId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'folders', folderId));
  }

  // =================== BREADCRUMBS ===================

  static async getBreadcrumbs(folderId: string | null): Promise<{ id: string | null; name: string }[]> {
    const crumbs: { id: string | null; name: string }[] = [
      { id: null, name: 'Arsip Utama' },
    ];
    if (!folderId || !db) return crumbs;

    const trail: { id: string; name: string }[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const snap = await getDoc(doc(db, 'folders', currentId));
      if (!snap.exists()) break;
      const data = snap.data() as FolderItem;
      trail.unshift({ id: snap.id, name: data.name });
      currentId = data.parentId;
    }

    return [...crumbs, ...trail];
  }

  // =================== FILES ===================

  static async getFiles(
    userId: string,
    folderId: string | null = null,
    includeDeleted = false
  ): Promise<FileItem[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'files'),
        where('userId', '==', userId),
        where('folderId', '==', folderId),
        where('isDeleted', '==', includeDeleted)
      );
      const snap = await getDocs(q);
      const list: FileItem[] = [];
      snap.forEach((d) => list.push({ ...(d.data() as FileItem), id: d.id }));
      return list;
    } catch (err) {
      console.error('Error fetching files from Firestore:', err);
      return [];
    }
  }

  static async getFavorites(userId: string): Promise<{ folders: FolderItem[]; files: FileItem[] }> {
    if (!db) return { folders: [], files: [] };
    try {
      const fQuery = query(
        collection(db, 'folders'),
        where('userId', '==', userId),
        where('isFavorite', '==', true),
        where('isDeleted', '==', false)
      );
      const fileQuery = query(
        collection(db, 'files'),
        where('userId', '==', userId),
        where('isFavorite', '==', true),
        where('isDeleted', '==', false)
      );

      const [fSnap, fileSnap] = await Promise.all([getDocs(fQuery), getDocs(fileQuery)]);
      const folders: FolderItem[] = [];
      fSnap.forEach((d) => folders.push({ ...(d.data() as FolderItem), id: d.id }));

      const files: FileItem[] = [];
      fileSnap.forEach((d) => files.push({ ...(d.data() as FileItem), id: d.id }));

      return { folders, files };
    } catch (err) {
      console.error('Error fetching favorites:', err);
      return { folders: [], files: [] };
    }
  }

  static async getTrash(userId: string): Promise<{ folders: FolderItem[]; files: FileItem[] }> {
    if (!db) return { folders: [], files: [] };
    try {
      const fQuery = query(
        collection(db, 'folders'),
        where('userId', '==', userId),
        where('isDeleted', '==', true)
      );
      const fileQuery = query(
        collection(db, 'files'),
        where('userId', '==', userId),
        where('isDeleted', '==', true)
      );

      const [fSnap, fileSnap] = await Promise.all([getDocs(fQuery), getDocs(fileQuery)]);
      const folders: FolderItem[] = [];
      fSnap.forEach((d) => folders.push({ ...(d.data() as FolderItem), id: d.id }));

      const files: FileItem[] = [];
      fileSnap.forEach((d) => files.push({ ...(d.data() as FileItem), id: d.id }));

      return { folders, files };
    } catch (err) {
      console.error('Error fetching trash:', err);
      return { folders: [], files: [] };
    }
  }

  static async createFileRecord(params: {
    userId: string;
    folderId: string | null;
    fileName: string;
    fileKey: string;
    fileSize: number;
    mimeType: string;
    downloadUrl?: string;
    previewUrl?: string;
  }): Promise<FileItem> {
    if (!db) throw new Error('Database Firestore tidak terhubung.');

    const ext = params.fileName.split('.').pop()?.toLowerCase() || '';
    const newFileData = {
      userId: params.userId,
      folderId: params.folderId,
      fileName: params.fileName,
      fileKey: params.fileKey,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      extension: ext,
      downloadUrl: params.downloadUrl || '',
      previewUrl: params.previewUrl || '',
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'files'), newFileData);
    return { ...newFileData, id: docRef.id };
  }

  static async renameFile(fileId: string, newFileName: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'files', fileId), {
      fileName: newFileName.trim(),
      updatedAt: new Date().toISOString(),
    });
  }

  static async moveFile(fileId: string, targetFolderId: string | null): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'files', fileId), {
      folderId: targetFolderId,
      updatedAt: new Date().toISOString(),
    });
  }

  static async toggleFavoriteFile(fileId: string, currentStatus?: boolean): Promise<void> {
    if (!db) return;
    let nextStatus = !currentStatus;
    if (currentStatus === undefined) {
      const snap = await getDoc(doc(db, 'files', fileId));
      nextStatus = snap.exists() ? !Boolean(snap.data()?.isFavorite) : true;
    }
    await updateDoc(doc(db, 'files', fileId), {
      isFavorite: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteFile(fileId: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'files', fileId), {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  static async restoreFile(fileId: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'files', fileId), {
      isDeleted: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    });
  }

  static async permanentlyDeleteFile(fileId: string, fileKey?: string): Promise<void> {
    if (!db) return;
    if (fileKey) {
      await StorageService.deleteFile(fileId, fileKey);
    }
    await deleteDoc(doc(db, 'files', fileId));
  }

  static async emptyTrash(userId: string): Promise<void> {
    if (!db) return;
    const { folders, files } = await this.getTrash(userId);
    for (const file of files) {
      if (file.fileKey) {
        await StorageService.deleteFile(file.id, file.fileKey);
      }
      await deleteDoc(doc(db, 'files', file.id));
    }
    for (const folder of folders) {
      await deleteDoc(doc(db, 'folders', folder.id));
    }
  }

  static async getSharedDocuments(userEmail: string): Promise<SharedDocumentItem[]> {
    if (!db || !userEmail) return [];
    try {
      const q = query(
        collection(db, 'sharedDocuments'),
        where('sharedWithEmail', '==', userEmail)
      );
      const snap = await getDocs(q);
      const list: SharedDocumentItem[] = [];
      snap.forEach((d) => list.push({ ...(d.data() as SharedDocumentItem), id: d.id }));
      return list;
    } catch {
      return [];
    }
  }
}
