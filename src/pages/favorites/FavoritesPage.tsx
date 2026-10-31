import React, { useState, useEffect } from 'react';
import { Star, Folder, FileText, Download, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ArchiveService } from '../../services/firestore/archiveService';
import { StorageService } from '../../services/storage/storageService';
import { FolderItem, FileItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';

export const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [favFolders, setFavFolders] = useState<FolderItem[]>([]);
  const [favFiles, setFavFiles] = useState<FileItem[]>([]);

  const loadFavorites = async () => {
    if (!user) return;
    const { folders, files } = await ArchiveService.getFavorites(user.id);
    setFavFolders(folders);
    setFavFiles(files);
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handleRemoveFavoriteFolder = async (id: string) => {
    await ArchiveService.toggleFavoriteFolder(id);
    showToast('Dihapus dari favorit.', 'info');
    await loadFavorites();
  };

  const handleRemoveFavoriteFile = async (id: string) => {
    await ArchiveService.toggleFavoriteFile(id);
    showToast('Dihapus dari favorit.', 'info');
    await loadFavorites();
  };

  const handleDownload = async (file: FileItem) => {
    try {
      await StorageService.downloadFile(file);
      showToast(`Mengunduh ${file.fileName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengunduh file', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-black text-2xl text-brand-black flex items-center gap-2">
          <Star className="w-6 h-6 fill-brand-sky text-brand-navy" />
          <span>Folder & Dokumen Favorit</span>
        </h2>
        <p className="text-xs text-brand-secondary font-medium">
          Akses kilat ke materi kuliah dan catatan tugas yang paling sering kita buka.
        </p>
      </div>

      {favFolders.length === 0 && favFiles.length === 0 ? (
        <div className="bg-white border-3 border-brand-black rounded-2xl p-12 text-center space-y-3 shadow-retro">
          <Star className="w-12 h-12 text-brand-secondary/40 mx-auto stroke-[2.5]" />
          <h3 className="font-display font-black text-xl text-brand-black">
            Belum Ada Item Favorit
          </h3>
          <p className="text-xs text-brand-secondary max-w-sm mx-auto">
            Klik ikon bintang pada folder atau dokumen di Arsip untuk menyimpannya di sini.
          </p>
          <div className="pt-2">
            <RetroButton variant="blue" size="sm" onClick={() => navigate('/archive')}>
              Buka Arsip Dokumen
            </RetroButton>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders */}
          {favFolders.length > 0 && (
            <WindowCard
              title="FOLDER FAVORIT"
              tag={`${favFolders.length} FOLDER`}
              headerBg="blue"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {favFolders.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => navigate('/archive')}
                    className="p-3.5 rounded-xl border-2 border-brand-black bg-brand-ice/40 hover:bg-brand-ice transition-all cursor-pointer flex items-center justify-between gap-2 shadow-retro-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-5 h-5 text-brand-black flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-heading font-extrabold text-xs truncate">
                          {f.name}
                        </div>
                        <div className="text-[10px] text-brand-secondary truncate">
                          {f.description || 'Folder kuliah'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavoriteFolder(f.id);
                      }}
                      className="p-1 rounded hover:bg-white text-brand-black"
                      title="Hapus dari Favorit"
                    >
                      <Star className="w-4 h-4 fill-brand-sky text-brand-navy" />
                    </button>
                  </div>
                ))}
              </div>
            </WindowCard>
          )}

          {/* Files */}
          {favFiles.length > 0 && (
            <WindowCard
              title="DOKUMEN FAVORIT"
              tag={`${favFiles.length} FILE`}
              headerBg="blue"
            >
              <div className="space-y-2">
                {favFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-ice/30 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded border border-brand-black bg-brand-sky flex items-center justify-center font-mono text-[10px] font-bold uppercase">
                        {file.extension}
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-extrabold text-xs truncate">
                          {file.fileName}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono">
                          {(file.fileSize / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1.5 rounded-lg border border-brand-black hover:bg-brand-ice"
                        title="Unduh"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFavoriteFile(file.id)}
                        className="p-1.5 rounded-lg border border-brand-black hover:bg-brand-ice"
                        title="Hapus dari Favorit"
                      >
                        <Star className="w-4 h-4 fill-brand-sky text-brand-navy" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </WindowCard>
          )}
        </div>
      )}
    </div>
  );
};
