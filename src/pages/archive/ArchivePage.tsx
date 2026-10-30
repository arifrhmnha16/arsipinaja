import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Folder,
  FolderPlus,
  Upload,
  Search,
  Grid,
  List as ListIcon,
  Star,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Edit2,
  FolderInput,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  ArrowUpDown,
  X,
  UploadCloud,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ArchiveService } from '../../services/firestore/archiveService';
import { StorageService } from '../../services/storage/storageService';
import { FolderItem, FileItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { RetroBreadcrumbs } from '../../components/ui/RetroBreadcrumbs';
import { RetroModal } from '../../components/ui/RetroModal';

export const ArchivePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation state synced with URL search params
  const folderParam = searchParams.get('folder');
  const currentFolderId = folderParam || null;

  const setCurrentFolder = (folderId: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (folderId) {
        next.set('folder', folderId);
      } else {
        next.delete('folder');
      }
      return next;
    });
  };

  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  // View & Filter states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('yellow');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFolderForAction, setSelectedFolderForAction] = useState<FolderItem | null>(null);
  const [selectedFileForAction, setSelectedFileForAction] = useState<FileItem | null>(null);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTargetName, setRenameTargetName] = useState('');

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetDestinationFolderId, setTargetDestinationFolderId] = useState<string | null>(null);

  const [previewFile, setPreviewFile] = useState<{ item: FileItem; url: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load content
  const loadArchive = () => {
    if (!user) return;
    const currentFolders = ArchiveService.getFolders(user.id, currentFolderId, false);
    const currentFiles = ArchiveService.getFiles(user.id, currentFolderId, false);
    const crumbs = ArchiveService.getBreadcrumbs(currentFolderId);

    setFolders(currentFolders);
    setFiles(currentFiles);
    setBreadcrumbs(crumbs);
  };

  useEffect(() => {
    loadArchive();
  }, [user, currentFolderId]);

  // Handle URL query actions (e.g. ?action=upload or ?action=new-folder)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'upload') {
      setIsUploadModalOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('action');
        return next;
      });
    } else if (action === 'new-folder') {
      setIsCreateFolderModalOpen(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('action');
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

  // Filter & Sort
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter((f) =>
    f.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.fileName.localeCompare(b.fileName)
        : b.fileName.localeCompare(a.fileName);
    }
    if (sortBy === 'date') {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? da - db : db - da;
    }
    if (sortBy === 'size') {
      return sortDirection === 'asc' ? a.fileSize - b.fileSize : b.fileSize - a.fileSize;
    }
    return 0;
  });

  // Folder Operations
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim()) return;

    try {
      ArchiveService.createFolder({
        userId: user.id,
        name: newFolderName,
        parentId: currentFolderId,
        description: newFolderDesc,
        color: newFolderColor,
      });
      showToast(`Folder "${newFolderName}" berhasil dibuat!`, 'success');
      setNewFolderName('');
      setNewFolderDesc('');
      setIsCreateFolderModalOpen(false);
      loadArchive();
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat folder', 'error');
    }
  };

  const handleToggleFavoriteFolder = (f: FolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    ArchiveService.toggleFavoriteFolder(f.id);
    showToast(
      f.isFavorite ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit',
      'info'
    );
    loadArchive();
  };

  const handleDeleteFolder = (folderId: string) => {
    ArchiveService.deleteFolder(folderId);
    showToast('Folder dipindahkan ke Tempat Sampah.', 'info');
    loadArchive();
  };

  // File Operations
  const handleFileUpload = async () => {
    if (!user || uploadFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(10);

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const res = await StorageService.uploadFile(
          file,
          user.id,
          currentFolderId,
          (percent) => setUploadProgress(percent)
        );

        await ArchiveService.createFileRecord({
          userId: user.id,
          folderId: currentFolderId,
          fileName: file.name,
          fileKey: res.fileKey,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          downloadUrl: res.downloadUrl,
          previewUrl: res.previewUrl,
        });
      }

      showToast(`${uploadFiles.length} file berhasil diunggah!`, 'success');
      setUploadFiles([]);
      setIsUploadModalOpen(false);
      loadArchive();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengunggah file', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadFile = async (fileItem: FileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await StorageService.downloadFile(fileItem);
      showToast(`Mengunduh ${fileItem.fileName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengunduh file', 'error');
    }
  };

  const handlePreviewFile = async (fileItem: FileItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const url = await StorageService.getPreviewUrl(fileItem);
      setPreviewFile({ item: fileItem, url });
    } catch (err: any) {
      showToast('Gagal memuat pratinjau file.', 'error');
    }
  };

  const handleDeleteFile = (fileId: string) => {
    ArchiveService.deleteFile(fileId);
    showToast('File dipindahkan ke Tempat Sampah.', 'info');
    loadArchive();
  };

  const handleToggleFavoriteFile = (fileItem: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    ArchiveService.toggleFavoriteFile(fileItem.id);
    showToast(
      fileItem.isFavorite ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit',
      'info'
    );
    loadArchive();
  };

  // Rename Target Execution
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTargetName.trim()) return;

    if (selectedFolderForAction) {
      ArchiveService.renameFolder(selectedFolderForAction.id, renameTargetName);
      showToast('Folder berhasil diubah namanya.', 'success');
    } else if (selectedFileForAction) {
      ArchiveService.renameFile(selectedFileForAction.id, renameTargetName);
      showToast('File berhasil diubah namanya.', 'success');
    }

    setIsRenameModalOpen(false);
    setSelectedFolderForAction(null);
    setSelectedFileForAction(null);
    loadArchive();
  };

  // Move Target Execution
  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFolderForAction) {
        ArchiveService.moveFolder(selectedFolderForAction.id, targetDestinationFolderId);
        showToast('Folder berhasil dipindahkan.', 'success');
      } else if (selectedFileForAction) {
        ArchiveService.moveFile(selectedFileForAction.id, targetDestinationFolderId);
        showToast('File berhasil dipindahkan.', 'success');
      }
      setIsMoveModalOpen(false);
      setSelectedFolderForAction(null);
      setSelectedFileForAction(null);
      loadArchive();
    } catch (err: any) {
      showToast(err.message || 'Gagal memindahkan item', 'error');
    }
  };

  // Helper file icons
  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-brand-pink stroke-[2.5]" />;
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="w-6 h-6 text-brand-blue stroke-[2.5]" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="w-6 h-6 text-brand-green stroke-[2.5]" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return <FileImage className="w-6 h-6 text-brand-yellow stroke-[2.5]" />;
      case 'zip':
        return <FileArchive className="w-6 h-6 text-brand-secondary stroke-[2.5]" />;
      default:
        return <FileCode className="w-6 h-6 text-brand-black stroke-[2.5]" />;
    }
  };

  // All available destination folders for move dialog
  const allUserFolders = user ? ArchiveService.getAllUserFolders(user.id) : [];

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Breadcrumb Navigation */}
        <RetroBreadcrumbs
          items={breadcrumbs}
          onNavigate={(folderId) => setCurrentFolder(folderId)}
          className="flex-1"
        />

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <RetroButton
            variant="yellow"
            size="sm"
            leftIcon={<FolderPlus className="w-4 h-4 stroke-[3]" />}
            onClick={() => setIsCreateFolderModalOpen(true)}
          >
            Folder Baru
          </RetroButton>

          <RetroButton
            variant="green"
            size="sm"
            leftIcon={<Upload className="w-4 h-4 stroke-[3]" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload File
          </RetroButton>
        </div>
      </div>

      {/* 2. Search, Filter & View Controls */}
      <div className="bg-white border-2 border-brand-black p-3 rounded-xl shadow-retro-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari folder atau dokumen..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border-2 border-brand-black bg-brand-cream/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Switches */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border-2 border-brand-black rounded-lg px-2 py-1 bg-brand-cream text-xs font-bold cursor-pointer focus:outline-none"
            >
              <option value="name">Nama</option>
              <option value="date">Tanggal</option>
              <option value="size">Ukuran</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-cream text-xs font-bold shadow-xs"
              title="Balik Urutan"
            >
              {sortDirection === 'asc' ? '↑ A-Z' : '↓ Z-A'}
            </button>
          </div>

          <div className="h-5 w-0.5 bg-brand-black/20 mx-1" />

          {/* Grid vs List View Toggle */}
          <div className="flex items-center border-2 border-brand-black rounded-lg overflow-hidden bg-brand-cream shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${
                viewMode === 'grid' ? 'bg-brand-yellow text-brand-black' : 'hover:bg-white'
              }`}
              title="Tampilan Grid"
            >
              <Grid className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${
                viewMode === 'list' ? 'bg-brand-yellow text-brand-black' : 'hover:bg-white'
              }`}
              title="Tampilan Daftar (List)"
            >
              <ListIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Empty State (Instructional and Friendly) */}
      {filteredFolders.length === 0 && sortedFiles.length === 0 && (
        <div className="bg-white border-3 border-brand-black rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-retro">
          <div className="w-20 h-20 rounded-2xl border-3 border-brand-black bg-brand-yellow/30 mx-auto flex items-center justify-center">
            <Folder className="w-10 h-10 text-brand-black stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black text-2xl text-brand-black">
              Folder ini masih kosong.
            </h3>
            <p className="text-sm font-medium text-brand-secondary max-w-sm mx-auto">
              Yuk, mulai simpan materi kuliahmu di sini agar belajar makin teratur dan bebas panik saat ujian!
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <RetroButton
              variant="green"
              size="md"
              leftIcon={<Upload className="w-4 h-4 stroke-[3]" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Dokumen
            </RetroButton>
            <RetroButton
              variant="yellow"
              size="md"
              leftIcon={<FolderPlus className="w-4 h-4 stroke-[3]" />}
              onClick={() => setIsCreateFolderModalOpen(true)}
            >
              Buat Subfolder
            </RetroButton>
          </div>
        </div>
      )}

      {/* 4. Folders Section */}
      {filteredFolders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-xs uppercase tracking-wider text-brand-secondary">
              Folder Perkuliahan ({filteredFolders.length})
            </h2>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5'
                : 'space-y-2'
            }
          >
            {filteredFolders.map((f) => {
              const folderColors: Record<string, string> = {
                yellow: 'bg-brand-yellow/30 border-brand-black',
                green: 'bg-brand-green/20 border-brand-black',
                pink: 'bg-brand-pink/30 border-brand-black',
                blue: 'bg-brand-blue/20 border-brand-black',
                cream: 'bg-brand-cream border-brand-black',
              };

              return (
                <div
                  key={f.id}
                  onClick={() => setCurrentFolder(f.id)}
                  className={`group relative p-3.5 rounded-xl border-2 transition-all cursor-pointer shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 bg-white ${
                    folderColors[f.color || 'yellow']
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg border-2 border-brand-black bg-brand-yellow flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Folder className="w-5 h-5 text-brand-black fill-brand-black/10 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-extrabold text-sm text-brand-black truncate">
                          {f.name}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono truncate">
                          {f.description || 'Folder materi'}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons on folder */}
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 flex-shrink-0">
                      <button
                        onClick={(e) => handleToggleFavoriteFolder(f, e)}
                        className="p-1 rounded hover:bg-white text-brand-black"
                        title={f.isFavorite ? 'Bintang aktif' : 'Tandai Bintang'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            f.isFavorite ? 'fill-brand-yellow text-brand-black' : 'text-brand-secondary'
                          }`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFolderForAction(f);
                          setRenameTargetName(f.name);
                          setIsRenameModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-white text-brand-black"
                        title="Ubah Nama"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFolderForAction(f);
                          setIsMoveModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-white text-brand-black"
                        title="Pindahkan Folder"
                      >
                        <FolderInput className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(f.id);
                        }}
                        className="p-1 rounded hover:bg-brand-pink text-brand-black"
                        title="Hapus Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Files Section */}
      {sortedFiles.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-extrabold text-xs uppercase tracking-wider text-brand-secondary">
              Dokumen ({sortedFiles.length})
            </h2>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handlePreviewFile(file)}
                  className="group relative p-4 rounded-xl border-2 border-brand-black bg-white hover:bg-brand-cream/30 transition-all cursor-pointer shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 flex flex-col justify-between h-44"
                >
                  <div>
                    {/* Top row: Extension icon & favorite */}
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg border-2 border-brand-black bg-white flex items-center justify-center shadow-xs">
                        {getFileIcon(file.extension)}
                      </div>
                      <button
                        onClick={(e) => handleToggleFavoriteFile(file, e)}
                        className="p-1 rounded hover:bg-brand-yellow/30"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            file.isFavorite
                              ? 'fill-brand-yellow text-brand-black'
                              : 'text-brand-secondary'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mt-3">
                      <div
                        className="font-heading font-extrabold text-xs text-brand-black line-clamp-2"
                        title={file.fileName}
                      >
                        {file.fileName}
                      </div>
                      <div className="text-[10px] text-brand-secondary font-mono mt-1">
                        {(file.fileSize / 1024).toFixed(0)} KB • {file.extension.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="pt-2 border-t border-brand-black/15 flex items-center justify-between gap-1">
                    <button
                      onClick={(e) => handlePreviewFile(file, e)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDownloadFile(file, e)}
                        className="p-1 rounded hover:bg-brand-green/20 text-brand-black"
                        title="Unduh File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFileForAction(file);
                          setRenameTargetName(file.fileName);
                          setIsRenameModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-brand-cream text-brand-black"
                        title="Ubah Nama"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFileForAction(file);
                          setIsMoveModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-brand-cream text-brand-black"
                        title="Pindahkan File"
                      >
                        <FolderInput className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="p-1 rounded hover:bg-brand-pink/40 text-brand-black"
                        title="Hapus File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white border-2 border-brand-black rounded-xl overflow-hidden shadow-retro-sm">
              <div className="grid grid-cols-12 px-4 py-2.5 bg-brand-cream border-b-2 border-brand-black text-[11px] font-mono font-bold text-brand-black uppercase">
                <div className="col-span-6">Nama Dokumen</div>
                <div className="col-span-2 text-right">Ukuran</div>
                <div className="col-span-2 text-center">Format</div>
                <div className="col-span-2 text-right">Aksi</div>
              </div>

              <div className="divide-y divide-brand-black/10">
                {sortedFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handlePreviewFile(file)}
                    className="grid grid-cols-12 items-center px-4 py-3 hover:bg-brand-yellow/10 transition-colors cursor-pointer text-xs"
                  >
                    <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="flex-shrink-0">{getFileIcon(file.extension)}</div>
                      <span className="font-heading font-extrabold text-brand-black truncate">
                        {file.fileName}
                      </span>
                    </div>

                    <div className="col-span-2 text-right font-mono text-brand-secondary text-[11px]">
                      {(file.fileSize / 1024).toFixed(0)} KB
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-brand-black bg-brand-cream uppercase">
                        {file.extension}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => handleDownloadFile(file, e)}
                        className="p-1.5 rounded hover:bg-brand-cream border border-brand-black shadow-xs"
                        title="Unduh"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        className="p-1.5 rounded hover:bg-brand-pink border border-brand-black shadow-xs"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE FOLDER */}
      <RetroModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        title="BUAT FOLDER BARU"
        tag="ARCHIVE"
        headerBg="yellow"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1.5">
              Nama Folder Perkuliahan
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Contoh: Algoritma Pemrograman, Pertemuan 01"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-brand-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1.5">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              value={newFolderDesc}
              onChange={(e) => setNewFolderDesc(e.target.value)}
              placeholder="Catatan topik materi kuliah..."
              className="w-full px-3.5 py-2 rounded-lg border-2 border-brand-black text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1.5">
              Warna Tag Folder
            </label>
            <div className="flex items-center gap-3">
              {[
                { name: 'yellow', bg: '#FFE500' },
                { name: 'green', bg: '#00A968' },
                { name: 'pink', bg: '#F381A6' },
                { name: 'blue', bg: '#3989C5' },
                { name: 'cream', bg: '#FFF0D9' },
              ].map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setNewFolderColor(c.name)}
                  style={{ backgroundColor: c.bg }}
                  className={`w-7 h-7 rounded-full border-2 border-brand-black transition-transform ${
                    newFolderColor === c.name ? 'scale-125 shadow-retro-sm' : 'opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-brand-black/20">
            <RetroButton
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsCreateFolderModalOpen(false)}
            >
              Batal
            </RetroButton>
            <RetroButton variant="yellow" size="sm" type="submit">
              Buat Folder
            </RetroButton>
          </div>
        </form>
      </RetroModal>

      {/* MODAL: UPLOAD FILE (DRAG & DROP + PROGRESS) */}
      <RetroModal
        isOpen={isUploadModalOpen}
        onClose={() => !isUploading && setIsUploadModalOpen(false)}
        title="UPLOAD DOKUMEN AKADEMIK"
        tag="CLOUDFLARE R2"
        headerBg="green"
      >
        <div className="space-y-4">
          {/* Dropzone Container */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                setUploadFiles(Array.from(e.dataTransfer.files));
              }
            }}
            className="border-3 border-dashed border-brand-black rounded-xl p-8 text-center bg-brand-cream/40 hover:bg-brand-cream/80 transition-colors cursor-pointer space-y-3"
          >
            <UploadCloud className="w-12 h-12 text-brand-black mx-auto stroke-[2.5]" />
            <div>
              <div className="font-heading font-extrabold text-sm text-brand-black">
                Klik atau tarik file ke sini untuk mengunggah
              </div>
              <p className="text-[11px] text-brand-secondary font-mono mt-1">
                Format didukung: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, WEBP, ZIP, TXT (Maks 50MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setUploadFiles(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />
          </div>

          {/* Selected Files List Preview */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <div className="text-xs font-bold font-mono text-brand-secondary">
                File terpilih ({uploadFiles.length}):
              </div>
              {uploadFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg border border-brand-black bg-white text-xs"
                >
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="font-mono text-[10px] text-brand-secondary">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Mengunggah...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-brand-cream border-2 border-brand-black rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-brand-green h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-brand-black/20">
            <RetroButton
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                setUploadFiles([]);
                setIsUploadModalOpen(false);
              }}
            >
              Batal
            </RetroButton>
            <RetroButton
              variant="green"
              size="sm"
              isLoading={isUploading}
              disabled={uploadFiles.length === 0}
              onClick={handleFileUpload}
            >
              Mulai Unggah ({uploadFiles.length})
            </RetroButton>
          </div>
        </div>
      </RetroModal>

      {/* MODAL: RENAME ITEM */}
      <RetroModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="UBAH NAMA ITEM"
        tag="EDIT"
        headerBg="pink"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1.5">
              Nama Baru
            </label>
            <input
              type="text"
              value={renameTargetName}
              onChange={(e) => setRenameTargetName(e.target.value)}
              required
              autoFocus
              className="w-full px-3.5 py-2 rounded-lg border-2 border-brand-black text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <RetroButton variant="outline" size="sm" type="button" onClick={() => setIsRenameModalOpen(false)}>
              Batal
            </RetroButton>
            <RetroButton variant="yellow" size="sm" type="submit">
              Simpan Perubahan
            </RetroButton>
          </div>
        </form>
      </RetroModal>

      {/* MODAL: MOVE ITEM TO FOLDER */}
      <RetroModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="PINDAHKAN KE FOLDER LAIN"
        tag="MOVE"
        headerBg="blue"
      >
        <form onSubmit={handleMoveSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1.5">
              Pilih Folder Tujuan
            </label>
            <select
              value={targetDestinationFolderId || ''}
              onChange={(e) => setTargetDestinationFolderId(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border-2 border-brand-black bg-white text-sm"
            >
              <option value="">📁 Root (Arsip Utama)</option>
              {allUserFolders
                .filter((f) => f.id !== selectedFolderForAction?.id)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    📂 {f.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <RetroButton variant="outline" size="sm" type="button" onClick={() => setIsMoveModalOpen(false)}>
              Batal
            </RetroButton>
            <RetroButton variant="green" size="sm" type="submit">
              Pindahkan Sekarang
            </RetroButton>
          </div>
        </form>
      </RetroModal>

      {/* MODAL: PREVIEW FILE */}
      {previewFile && (
        <RetroModal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          title={`PRATINJAU: ${previewFile.item.fileName}`}
          tag={previewFile.item.extension.toUpperCase()}
          headerBg="cream"
          maxWidth="3xl"
        >
          <div className="space-y-4">
            <div className="border-2 border-brand-black rounded-xl overflow-hidden bg-brand-cream/30 min-h-[300px] max-h-[60vh] flex items-center justify-center p-4">
              {['jpg', 'jpeg', 'png', 'webp'].includes(previewFile.item.extension.toLowerCase()) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.item.fileName}
                  className="max-h-[50vh] object-contain rounded-lg border border-brand-black"
                />
              ) : previewFile.item.extension.toLowerCase() === 'pdf' ? (
                <iframe
                  src={previewFile.url}
                  title="PDF Preview"
                  className="w-full h-[55vh] rounded-lg border border-brand-black"
                />
              ) : (
                <div className="text-center space-y-3 py-8">
                  {getFileIcon(previewFile.item.extension)}
                  <div className="font-heading font-extrabold text-base text-brand-black">
                    {previewFile.item.fileName}
                  </div>
                  <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                    Pratinjau langsung format ini dapat dibuka setelah diunduh ke komputer Anda.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono font-bold text-brand-secondary">
                Ukuran: {(previewFile.item.fileSize / 1024).toFixed(0)} KB
              </span>
              <RetroButton
                variant="yellow"
                size="sm"
                leftIcon={<Download className="w-4 h-4 stroke-[3]" />}
                onClick={() => handleDownloadFile(previewFile.item)}
              >
                Unduh Dokumen
              </RetroButton>
            </div>
          </div>
        </RetroModal>
      )}
    </div>
  );
};
