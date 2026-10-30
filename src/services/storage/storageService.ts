import { FileItem } from '../../types';
import { saveLocalBlob, getLocalBlob, deleteLocalBlob } from './idbStorage';
import { auth } from '../firebase/config';

const WORKER_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || '';
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 
  'jpg', 'jpeg', 'png', 'webp', 'zip', 'txt'
];

export class StorageService {
  static isWorkerConfigured(): boolean {
    return Boolean(WORKER_URL && WORKER_URL.startsWith('http'));
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'Ukuran file melebihi batas maksimal 50 MB.' };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return { 
        valid: false, 
        error: `Format .${extension} tidak didukung. Didukung: ${ALLOWED_EXTENSIONS.join(', ')}` 
      };
    }

    return { valid: true };
  }

  static async uploadFile(
    file: File,
    userId: string,
    folderId: string | null,
    onProgress?: (percent: number) => void
  ): Promise<{ fileKey: string; downloadUrl: string; previewUrl: string; fileId: string }> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileId = 'file_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileKey = `${userId}/${folderId || 'root'}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    if (this.isWorkerConfigured() && auth?.currentUser) {
      // Production Cloudflare R2 Upload via Cloudflare Worker
      const token = await auth.currentUser.getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileId', fileId);
      formData.append('folderId', folderId || '');
      formData.append('fileKey', fileKey);

      if (onProgress) onProgress(20);

      const response = await fetch(`${WORKER_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mengunggah file ke Cloudflare R2');
      }

      const result = await response.json();
      if (onProgress) onProgress(100);

      return {
        fileId,
        fileKey: result.fileKey || fileKey,
        downloadUrl: `${WORKER_URL}/download/${fileId}`,
        previewUrl: `${WORKER_URL}/preview/${fileId}`,
      };
    } else {
      // Local/Offline Mode with IndexedDB Blob persistence
      if (onProgress) onProgress(35);
      await saveLocalBlob(fileId, file);
      if (onProgress) onProgress(100);

      const objectUrl = URL.createObjectURL(file);
      return {
        fileId,
        fileKey,
        downloadUrl: objectUrl,
        previewUrl: objectUrl,
      };
    }
  }

  static async getPreviewUrl(fileItem: FileItem): Promise<string> {
    if (this.isWorkerConfigured() && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      return `${WORKER_URL}/preview/${fileItem.id}?token=${encodeURIComponent(token)}`;
    }

    // Check IndexedDB
    const blob = await getLocalBlob(fileItem.id);
    if (blob) {
      return URL.createObjectURL(blob);
    }

    if (fileItem.previewUrl) {
      return fileItem.previewUrl;
    }

    return '';
  }

  static async downloadFile(fileItem: FileItem): Promise<void> {
    let downloadUrl = fileItem.downloadUrl;

    if (this.isWorkerConfigured() && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      downloadUrl = `${WORKER_URL}/download/${fileItem.id}?token=${encodeURIComponent(token)}`;
    } else {
      const blob = await getLocalBlob(fileItem.id);
      if (blob) {
        downloadUrl = URL.createObjectURL(blob);
      }
    }

    if (!downloadUrl) {
      throw new Error('File tidak dapat ditemukan untuk diunduh.');
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileItem.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  static async deleteFile(fileId: string, fileKey: string): Promise<void> {
    if (this.isWorkerConfigured() && auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      await fetch(`${WORKER_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileKey }),
      });
    }

    await deleteLocalBlob(fileId);
  }
}
