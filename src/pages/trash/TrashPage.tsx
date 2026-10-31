import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Folder, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ArchiveService } from '../../services/firestore/archiveService';
import { FolderItem, FileItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { RetroModal } from '../../components/ui/RetroModal';

export const TrashPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [trashFolders, setTrashFolders] = useState<FolderItem[]>([]);
  const [trashFiles, setTrashFiles] = useState<FileItem[]>([]);
  const [isConfirmEmptyModalOpen, setIsConfirmEmptyModalOpen] = useState(false);

  const loadTrash = async () => {
    if (!user) return;
    const { folders, files } = await ArchiveService.getTrash(user.id);
    setTrashFolders(folders);
    setTrashFiles(files);
  };

  useEffect(() => {
    loadTrash();
  }, [user]);

  const handleRestoreFolder = async (id: string) => {
    await ArchiveService.restoreFolder(id);
    showToast('Folder berhasil dipulihkan ke Arsip.', 'success');
    await loadTrash();
  };

  const handleRestoreFile = async (id: string) => {
    await ArchiveService.restoreFile(id);
    showToast('Dokumen berhasil dipulihkan ke Arsip.', 'success');
    await loadTrash();
  };

  const handlePermanentDeleteFolder = async (id: string) => {
    await ArchiveService.permanentlyDeleteFolder(id);
    showToast('Folder dihapus permanen.', 'info');
    await loadTrash();
  };

  const handlePermanentDeleteFile = async (id: string) => {
    await ArchiveService.permanentlyDeleteFile(id);
    showToast('Dokumen dihapus permanen.', 'info');
    await loadTrash();
  };

  const handleEmptyTrash = async () => {
    if (!user) return;
    await ArchiveService.emptyTrash(user.id);
    showToast('Tempat sampah telah dikosongkan.', 'success');
    setIsConfirmEmptyModalOpen(false);
    await loadTrash();
  };

  const totalItems = trashFolders.length + trashFiles.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-2xl text-brand-black flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-brand-navy" />
            <span>Tempat Sampah (Trash)</span>
          </h2>
          <p className="text-xs text-brand-secondary font-medium">
            Item yang dihapus dapat dipulihkan kapan saja ke lokasi arsip semula.
          </p>
        </div>

        {totalItems > 0 && (
          <RetroButton
            variant="blue"
            size="sm"
            leftIcon={<AlertTriangle className="w-4 h-4 stroke-[2.5]" />}
            onClick={() => setIsConfirmEmptyModalOpen(true)}
          >
            Kosongkan Tempat Sampah
          </RetroButton>
        )}
      </div>

      {totalItems === 0 ? (
        <div className="bg-white border-3 border-brand-black rounded-2xl p-12 text-center space-y-3 shadow-retro">
          <Trash2 className="w-12 h-12 text-brand-secondary/40 mx-auto stroke-[2.5]" />
          <h3 className="font-display font-black text-xl text-brand-black">
            Tempat Sampah Kosong
          </h3>
          <p className="text-xs text-brand-secondary max-w-sm mx-auto">
            Tidak ada dokumen atau folder yang sedang berada di dalam tempat sampah.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders in Trash */}
          {trashFolders.length > 0 && (
            <WindowCard
              title="FOLDER DI TEMPAT SAMPAH"
              tag={`${trashFolders.length} FOLDER`}
              headerBg="blue"
            >
              <div className="space-y-2">
                {trashFolders.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-brand-black bg-white shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-5 h-5 text-brand-secondary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-heading font-extrabold text-xs truncate">
                          {f.name}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono">
                          Dihapus: {f.deletedAt ? new Date(f.deletedAt).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestoreFolder(f.id)}
                        className="btn-retro px-2 sm:px-2.5 py-1 text-xs font-bold rounded border border-brand-black bg-brand-blue text-white inline-flex items-center gap-1 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteFolder(f.id)}
                        className="btn-retro px-2 sm:px-2.5 py-1 text-xs font-bold rounded border border-brand-black bg-white hover:bg-brand-ice text-brand-black inline-flex items-center gap-1 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Hapus Permanen</span>
                        <span className="xs:hidden">Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </WindowCard>
          )}

          {/* Files in Trash */}
          {trashFiles.length > 0 && (
            <WindowCard
              title="FILE DI TEMPAT SAMPAH"
              tag={`${trashFiles.length} BERKAS`}
              headerBg="blue"
            >
              <div className="space-y-2">
                {trashFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-brand-black bg-white shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-brand-secondary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-heading font-extrabold text-xs truncate">
                          {file.fileName}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono">
                          {(file.fileSize / 1024).toFixed(0)} KB • Dihapus: {file.deletedAt ? new Date(file.deletedAt).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRestoreFile(file.id)}
                        className="btn-retro px-2 sm:px-2.5 py-1 text-xs font-bold rounded border border-brand-black bg-brand-blue text-white inline-flex items-center gap-1 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteFile(file.id)}
                        className="btn-retro px-2 sm:px-2.5 py-1 text-xs font-bold rounded border border-brand-black bg-white hover:bg-brand-ice text-brand-black inline-flex items-center gap-1 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Hapus Permanen</span>
                        <span className="xs:hidden">Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </WindowCard>
          )}
        </div>
      )}

      {/* MODAL: CONFIRM EMPTY TRASH */}
      <RetroModal
        isOpen={isConfirmEmptyModalOpen}
        onClose={() => setIsConfirmEmptyModalOpen(false)}
        title="KOSONGKAN TEMPAT SAMPAH"
        tag="WARNING"
        headerBg="blue"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-brand-black font-medium leading-relaxed">
            Semua {totalItems} file dan folder di Tempat Sampah akan dihapus secara permanen dari server Cloudflare R2 dan database. Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <RetroButton
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmEmptyModalOpen(false)}
            >
              Batal
            </RetroButton>
            <RetroButton variant="blue" size="sm" onClick={handleEmptyTrash}>
              Ya, Kosongkan Sekarang
            </RetroButton>
          </div>
        </div>
      </RetroModal>
    </div>
  );
};
