import React, { useState, useEffect } from 'react';
import { Share2, Download, FileText, UserCheck, Shield } from 'lucide-react';
import { ArchiveService } from '../../services/firestore/archiveService';
import { SharedDocumentItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const SharedDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [sharedDocs, setSharedDocs] = useState<SharedDocumentItem[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user?.email) return;
    const loadShared = async () => {
      const docs = await ArchiveService.getSharedDocuments(user.email);
      setSharedDocs(docs);
    };
    loadShared();
  }, [user]);

  const handleDownload = (doc: SharedDocumentItem) => {
    showToast(`Mengunduh dokumen bersama: ${doc.fileName}`, 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-black text-2xl text-brand-black flex items-center gap-2">
          <Share2 className="w-6 h-6 text-brand-blue" />
          <span>Dokumen yang Dibagikan</span>
        </h2>
        <p className="text-xs text-brand-secondary font-medium">
          Materi kuliah, catatan belajar, dan ringkasan tugas yang dibagikan berdua.
        </p>
      </div>

      <WindowCard
        title="DOKUMEN BERSAMA DITERIMA"
        tag={`${sharedDocs.length} BERKAS`}
        headerBg="blue"
      >
        {sharedDocs.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Share2 className="w-10 h-10 text-brand-secondary/40 mx-auto" />
            <h4 className="font-heading font-extrabold text-sm text-brand-black">
              Belum Ada Dokumen Dibagikan
            </h4>
            <p className="text-xs text-brand-secondary max-w-sm mx-auto">
              Dokumen atau materi kuliah yang dibagikan partner ke email Anda ({user?.email}) akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sharedDocs.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border-2 border-brand-black bg-white hover:bg-brand-ice/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg border-2 border-brand-black bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-brand-black stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-heading font-extrabold text-sm text-brand-black truncate">
                      {item.fileName}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] text-brand-secondary font-mono mt-0.5">
                      <span>Dibagikan oleh: {item.ownerName}</span>
                      <span>•</span>
                      <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span className="font-bold text-brand-black uppercase">
                        Izin: {item.permissions}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <RetroButton
                    variant="blue"
                    size="sm"
                    leftIcon={<Download className="w-3.5 h-3.5 stroke-[3]" />}
                    onClick={() => handleDownload(item)}
                  >
                    Unduh Dokumen
                  </RetroButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </WindowCard>
    </div>
  );
};
