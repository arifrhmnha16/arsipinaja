export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'disabled';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  semester?: number;
  major?: string;
  university?: string;
  telegramChatId?: string | null;
  telegramUsername?: string | null;
  telegramConnectedAt?: string | null;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderItem {
  id: string;
  userId: string;
  name: string;
  parentId: string | null; // null means root folder
  description?: string;
  color?: string; // Retro color tag: yellow, green, pink, blue
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  userId: string;
  folderId: string | null; // null means root
  fileName: string;
  fileKey: string;
  fileSize: number; // in bytes
  mimeType: string;
  extension: string;
  downloadUrl?: string;
  previewUrl?: string;
  blobData?: string; // Base64 or Blob storage for offline preview/download
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface TaskChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskReminderSettings {
  h3: boolean; // 3 days before deadline
  h1: boolean; // 1 day before deadline
  h0: boolean; // on the day of deadline
  overdue: boolean; // when task becomes overdue
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  subject: string;
  folderId?: string | null; // Associated folder (e.g. Algoritma Pemrograman)
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm (WIB)
  priority: TaskPriority;
  status: TaskStatus;
  checklist: TaskChecklistItem[];
  attachments: string[]; // List of file IDs or names
  notes?: string;
  reminderSettings: TaskReminderSettings;
  createdAt: string;
  updatedAt: string;
}

export interface SharedDocumentItem {
  id: string;
  ownerId: string;
  ownerName: string;
  sharedWithEmail: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  permissions: 'view' | 'download';
  createdAt: string;
}

export interface TelegramVerificationCode {
  id: string;
  userId: string;
  code: string; // 6-digit code
  expiresAt: string; // ISO String
  isUsed: boolean;
  usedAt?: string | null;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  totalFolders: number;
  totalStorageBytes: number;
  activeTasks: number;
}
