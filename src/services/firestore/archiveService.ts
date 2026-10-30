import { FolderItem, FileItem } from '../../types';
import { INITIAL_FOLDERS, INITIAL_FILES } from '../mockData';
import { StorageService } from '../storage/storageService';

const FOLDERS_KEY = 'arsipinaja_folders';
const FILES_KEY = 'arsipinaja_files';

function getFolders(): FolderItem[] {
  const data = localStorage.getItem(FOLDERS_KEY);
  if (!data) {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(INITIAL_FOLDERS));
    return INITIAL_FOLDERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_FOLDERS;
  }
}

function saveFolders(folders: FolderItem[]) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function getFiles(): FileItem[] {
  const data = localStorage.getItem(FILES_KEY);
  if (!data) {
    localStorage.setItem(FILES_KEY, JSON.stringify(INITIAL_FILES));
    return INITIAL_FILES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_FILES;
  }
}

function saveFiles(files: FileItem[]) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export class ArchiveService {
  // FOLDERS
  static getFolders(userId: string, parentId: string | null = null, includeDeleted = false): FolderItem[] {
    const all = getFolders();
    return all.filter(
      (f) => f.userId === userId && f.parentId === parentId && (includeDeleted ? f.isDeleted : !f.isDeleted)
    );
  }

  static getFolderById(folderId: string): FolderItem | null {
    const all = getFolders();
    return all.find((f) => f.id === folderId) || null;
  }

  static getAllUserFolders(userId: string): FolderItem[] {
    return getFolders().filter((f) => f.userId === userId && !f.isDeleted);
  }

  static createFolder(params: {
    userId: string;
    name: string;
    parentId?: string | null;
    description?: string;
    color?: string;
  }): FolderItem {
    const folders = getFolders();
    const newFolder: FolderItem = {
      id: 'f_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      userId: params.userId,
      name: params.name.trim(),
      parentId: params.parentId || null,
      description: params.description?.trim() || '',
      color: params.color || 'yellow',
      isFavorite: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    folders.push(newFolder);
    saveFolders(folders);
    return newFolder;
  }

  static renameFolder(folderId: string, newName: string): FolderItem {
    const folders = getFolders();
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) throw new Error('Folder tidak ditemukan.');

    folder.name = newName.trim();
    folder.updatedAt = new Date().toISOString();
    saveFolders(folders);
    return folder;
  }

  static moveFolder(folderId: string, targetParentId: string | null): FolderItem {
    if (folderId === targetParentId) throw new Error('Tidak bisa memindahkan folder ke dalam dirinya sendiri.');
    
    // Prevent moving folder into its own sub-tree
    const folders = getFolders();
    let curr = targetParentId ? folders.find((f) => f.id === targetParentId) : null;
    while (curr) {
      if (curr.id === folderId) {
        throw new Error('Tidak dapat memindahkan folder induk ke dalam subfoldernya sendiri.');
      }
      curr = curr.parentId ? folders.find((f) => f.id === curr!.parentId) : null;
    }

    const folder = folders.find((f) => f.id === folderId);
    if (!folder) throw new Error('Folder tidak ditemukan.');

    folder.parentId = targetParentId;
    folder.updatedAt = new Date().toISOString();
    saveFolders(folders);
    return folder;
  }

  static toggleFavoriteFolder(folderId: string): FolderItem {
    const folders = getFolders();
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) throw new Error('Folder tidak ditemukan.');

    folder.isFavorite = !folder.isFavorite;
    folder.updatedAt = new Date().toISOString();
    saveFolders(folders);
    return folder;
  }

  static deleteFolder(folderId: string): void {
    const folders = getFolders();
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) throw new Error('Folder tidak ditemukan.');

    folder.isDeleted = true;
    folder.deletedAt = new Date().toISOString();
    folder.updatedAt = new Date().toISOString();
    saveFolders(folders);
  }

  static restoreFolder(folderId: string): void {
    const folders = getFolders();
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) throw new Error('Folder tidak ditemukan.');

    folder.isDeleted = false;
    folder.deletedAt = null;
    folder.updatedAt = new Date().toISOString();
    saveFolders(folders);
  }

  static permanentlyDeleteFolder(folderId: string): void {
    const folders = getFolders().filter((f) => f.id !== folderId);
    saveFolders(folders);
  }

  // BREADCRUMBS TRAVERSAL
  static getBreadcrumbs(folderId: string | null): { id: string | null; name: string }[] {
    const crumbs: { id: string | null; name: string }[] = [
      { id: null, name: 'Arsip Utama' },
    ];
    if (!folderId) return crumbs;

    const all = getFolders();
    const trail: { id: string; name: string }[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const f = all.find((item) => item.id === currentId);
      if (!f) break;
      trail.unshift({ id: f.id, name: f.name });
      currentId = f.parentId;
    }

    return [...crumbs, ...trail];
  }

  // FILES
  static getFiles(userId: string, folderId: string | null = null, includeDeleted = false): FileItem[] {
    const all = getFiles();
    return all.filter(
      (file) => file.userId === userId && file.folderId === folderId && (includeDeleted ? file.isDeleted : !file.isDeleted)
    );
  }

  static getFavorites(userId: string): { folders: FolderItem[]; files: FileItem[] } {
    const folders = getFolders().filter((f) => f.userId === userId && f.isFavorite && !f.isDeleted);
    const files = getFiles().filter((f) => f.userId === userId && f.isFavorite && !f.isDeleted);
    return { folders, files };
  }

  static getTrash(userId: string): { folders: FolderItem[]; files: FileItem[] } {
    const folders = getFolders().filter((f) => f.userId === userId && f.isDeleted);
    const files = getFiles().filter((f) => f.userId === userId && f.isDeleted);
    return { folders, files };
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
    const files = getFiles();
    const ext = params.fileName.split('.').pop()?.toLowerCase() || '';
    const newFile: FileItem = {
      id: 'file_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      userId: params.userId,
      folderId: params.folderId,
      fileName: params.fileName,
      fileKey: params.fileKey,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      extension: ext,
      downloadUrl: params.downloadUrl,
      previewUrl: params.previewUrl,
      isFavorite: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    files.push(newFile);
    saveFiles(files);
    return newFile;
  }

  static renameFile(fileId: string, newFileName: string): FileItem {
    const files = getFiles();
    const file = files.find((f) => f.id === fileId);
    if (!file) throw new Error('File tidak ditemukan.');

    file.fileName = newFileName.trim();
    file.updatedAt = new Date().toISOString();
    saveFiles(files);
    return file;
  }

  static moveFile(fileId: string, targetFolderId: string | null): FileItem {
    const files = getFiles();
    const file = files.find((f) => f.id === fileId);
    if (!file) throw new Error('File tidak ditemukan.');

    file.folderId = targetFolderId;
    file.updatedAt = new Date().toISOString();
    saveFiles(files);
    return file;
  }

  static toggleFavoriteFile(fileId: string): FileItem {
    const files = getFiles();
    const file = files.find((f) => f.id === fileId);
    if (!file) throw new Error('File tidak ditemukan.');

    file.isFavorite = !file.isFavorite;
    file.updatedAt = new Date().toISOString();
    saveFiles(files);
    return file;
  }

  static deleteFile(fileId: string): void {
    const files = getFiles();
    const file = files.find((f) => f.id === fileId);
    if (!file) throw new Error('File tidak ditemukan.');

    file.isDeleted = true;
    file.deletedAt = new Date().toISOString();
    file.updatedAt = new Date().toISOString();
    saveFiles(files);
  }

  static restoreFile(fileId: string): void {
    const files = getFiles();
    const file = files.find((f) => f.id === fileId);
    if (!file) throw new Error('File tidak ditemukan.');

    file.isDeleted = false;
    file.deletedAt = null;
    file.updatedAt = new Date().toISOString();
    saveFiles(files);
  }

  static async permanentlyDeleteFile(fileId: string): Promise<void> {
    const files = getFiles();
    const file = files.find((f) => f.id === fileId);
    if (file) {
      await StorageService.deleteFile(file.id, file.fileKey);
    }
    const updated = files.filter((f) => f.id !== fileId);
    saveFiles(updated);
  }

  static async emptyTrash(userId: string): Promise<void> {
    const files = getFiles();
    const trashFiles = files.filter((f) => f.userId === userId && f.isDeleted);
    for (const f of trashFiles) {
      await StorageService.deleteFile(f.id, f.fileKey);
    }
    saveFiles(files.filter((f) => !(f.userId === userId && f.isDeleted)));

    const folders = getFolders();
    saveFolders(folders.filter((f) => !(f.userId === userId && f.isDeleted)));
  }
}
