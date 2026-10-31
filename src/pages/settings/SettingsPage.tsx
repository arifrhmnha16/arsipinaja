import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Send,
  Bell,
  HardDrive,
  Sliders,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Key,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { TelegramService } from '../../services/telegram/telegramService';
import { AuthService } from '../../services/auth/authService';
import { TelegramVerificationCode, TaskReminderSettings } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { RetroModal } from '../../components/ui/RetroModal';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'profile' | 'telegram' | 'preferences' | 'storage'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [major, setMajor] = useState(user?.major || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [semester, setSemester] = useState(user?.semester || 1);

  // Telegram Code Generation & Modal
  const [activeVerification, setActiveVerification] = useState<TelegramVerificationCode | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [manualChatIdInput, setManualChatIdInput] = useState('');
  const [isDetectingChat, setIsDetectingChat] = useState(false);
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Reminder Preferences
  const [reminderSettings, setReminderSettings] = useState<TaskReminderSettings>({
    h3: true,
    h1: true,
    h0: true,
    overdue: true,
  });

  // Handle URL query ?tab=telegram
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'telegram', 'preferences', 'storage'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setMajor(user.major || '');
      setUniversity(user.university || '');
      setSemester(user.semester || 1);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await AuthService.updateProfile(user.id, {
        name,
        major,
        university,
        semester: Number(semester),
      });
      refreshUser();
      showToast('Profil berhasil disimpan!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan profil', 'error');
    }
  };

  const handleAutoDetectTelegram = async () => {
    if (!user) return;
    setIsDetectingChat(true);
    try {
      const res = await TelegramService.detectRecentChatFromBot();
      if (!res.success || !res.data) {
        showToast(res.message, 'error');
        return;
      }

      const { chatId, firstName, username } = res.data;
      const connectRes = await TelegramService.connectRealTelegram(user.id, chatId, username);

      if (connectRes.success) {
        refreshUser();
        showToast(`Berhasil terhubung ke Telegram ${firstName}!`, 'success');
        setIsConnectModalOpen(false);
      } else {
        showToast(connectRes.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal mendeteksi akun Telegram.', 'error');
    } finally {
      setIsDetectingChat(false);
    }
  };

  const handleManualConnectTelegram = async () => {
    if (!user || !manualChatIdInput.trim()) {
      showToast('Masukkan Chat ID Telegram Anda.', 'error');
      return;
    }
    setIsVerifying(true);
    try {
      const connectRes = await TelegramService.connectRealTelegram(user.id, manualChatIdInput.trim());
      if (connectRes.success) {
        refreshUser();
        showToast(connectRes.message, 'success');
        setIsConnectModalOpen(false);
        setManualChatIdInput('');
      } else {
        showToast(connectRes.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghubungkan Telegram.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestSendHello = async () => {
    if (!user?.telegramChatId) {
      showToast('Akun Telegram belum terhubung.', 'error');
      return;
    }
    setIsTestingSend(true);
    try {
      const res = await TelegramService.sendTestHelloMessage(user.telegramChatId, user.name);
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengirim pesan tes.', 'error');
    } finally {
      setIsTestingSend(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    if (!user) return;
    await TelegramService.disconnectTelegram(user.id);
    refreshUser();
    showToast('Koneksi Telegram berhasil diputus.', 'info');
  };

  const handleToggleReminder = (key: keyof TaskReminderSettings) => {
    const updated = { ...reminderSettings, [key]: !reminderSettings[key] };
    setReminderSettings(updated);
    showToast('Preferensi notifikasi pengingat diperbarui.', 'success');
  };

  // Storage info calculations
  const storageUsedMB = (user?.storageUsedBytes || 0) / (1024 * 1024);
  const storageQuotaMB = (user?.storageQuotaBytes || 15 * 1024 * 1024 * 1024) / (1024 * 1024);
  const storagePercentage = Math.min(100, Math.round((storageUsedMB / storageQuotaMB) * 100));

  const isConnected = Boolean(user?.telegramChatId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-black text-2xl text-brand-black">
          Pengaturan Akun & Sistem
        </h2>
        <p className="text-xs text-brand-secondary font-medium">
          Kelola profil akun kita, integrasi bot Telegram untuk pengingat tugas kuliah, dan preferensi.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b-2 border-brand-black/20 pb-3 overflow-x-auto sm:flex-wrap">
        {[
          { id: 'profile', label: 'Profil Saya', icon: User },
          { id: 'telegram', label: 'Bot Telegram', icon: Send },
          { id: 'preferences', label: 'Preferensi', icon: Sliders },
          { id: 'storage', label: 'Kapasitas Storage', icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg font-heading font-extrabold text-xs transition-all border-2 flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-brand-blue text-white border-brand-black shadow-retro-sm'
                  : 'bg-white text-brand-black/70 border-brand-black/20 hover:border-brand-black hover:text-brand-black'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <WindowCard title="PROFIL AKUN SAYA" tag="ACCOUNT" headerBg="blue">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="flex items-center gap-4 pb-3 border-b border-brand-black/15">
              <div className="w-16 h-16 rounded-full border-3 border-brand-black bg-brand-blue text-white flex items-center justify-center font-display font-black text-2xl shadow-retro-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-heading font-black text-base text-brand-black">
                  {user?.name}
                </div>
                <div className="text-xs text-brand-secondary font-mono">{user?.email}</div>
                <div className="text-[10px] font-mono font-bold mt-1 inline-block px-2 py-0.5 rounded border border-brand-black bg-brand-ice">
                  Akses: {user?.role.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs bg-neutral-100 font-mono text-brand-secondary cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                  Jurusan / Minat Kuliah
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                  Semester Aktif
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                  Universitas / Kampus Kuliah
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-3">
              <RetroButton variant="blue" size="sm" type="submit">
                Simpan Perubahan Profil
              </RetroButton>
            </div>
          </form>
        </WindowCard>
      )}

      {/* TAB 2: TELEGRAM BOT INTEGRATION */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          <WindowCard
            title="KONEKSI TELEGRAM BOT NOTIFIKASI"
            tag="BOT API"
            headerBg="blue"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-brand-black bg-brand-ice shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border-2 border-brand-black bg-brand-blue text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Send className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-extrabold text-sm text-brand-black">
                        Telegram Bot ArsipinAja
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-brand-black ${
                          isConnected
                            ? 'bg-brand-blue text-white'
                            : 'bg-brand-navy text-white'
                        }`}
                      >
                        {isConnected ? 'TERHUBUNG' : 'BELUM TERHUBUNG'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-secondary mt-0.5">
                      {isConnected
                        ? `Chat ID: ${user?.telegramChatId} • Terhubung sejak ${new Date(user?.telegramConnectedAt || Date.now()).toLocaleDateString('id-ID')}`
                        : 'Hubungkan akun Telegram untuk menerima pengingat deadline otomatis ke HP.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isConnected && (
                    <RetroButton
                      variant="white"
                      size="sm"
                      isLoading={isTestingSend}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      onClick={handleTestSendHello}
                    >
                      Tes Kirim Pesan
                    </RetroButton>
                  )}
                  {isConnected ? (
                    <>
                      <RetroButton
                        variant="white"
                        size="sm"
                        onClick={() => {
                          setManualChatIdInput(user?.telegramChatId || '');
                          setIsConnectModalOpen(true);
                        }}
                      >
                        Ganti Akun
                      </RetroButton>
                      <RetroButton
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectTelegram}
                      >
                        Putuskan
                      </RetroButton>
                    </>
                  ) : (
                    <RetroButton
                      variant="blue"
                      size="sm"
                      onClick={() => setIsConnectModalOpen(true)}
                    >
                      Hubungkan Telegram
                    </RetroButton>
                  )}
                </div>
              </div>

              {/* Reminder Schedules Preferences */}
              <div className="pt-4 border-t-2 border-brand-black/15">
                <h3 className="font-heading font-black text-sm uppercase text-brand-black mb-1">
                  Jadwal Pengingat Tugas Otomatis
                </h3>
                <p className="text-xs text-brand-secondary mb-3">
                  Pilih waktu pengingat yang akan dikirimkan bot ke Telegram Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'h3', label: 'H-3 Sebelum Deadline', desc: 'Pengingat awal persiapan materi tugas' },
                    { key: 'h1', label: 'H-1 Sebelum Deadline', desc: 'Pengingat mendesak esok hari' },
                    { key: 'h0', label: 'H-0 Hari Deadline', desc: 'Pengingat final di hari pengumpulan tugas' },
                    { key: 'overdue', label: 'Overdue Reminder', desc: 'Pemberitahuan jika tugas melewati tenggat' },
                  ].map((rem) => {
                    const k = rem.key as keyof TaskReminderSettings;
                    const isChecked = reminderSettings[k];

                    return (
                      <label
                        key={rem.key}
                        className="flex items-start gap-3 p-3 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-ice/30 transition-colors cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleReminder(k)}
                          className="mt-0.5 w-4 h-4 rounded border-2 border-brand-black text-brand-blue focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-brand-black">{rem.label}</div>
                          <div className="text-[10px] text-brand-secondary">{rem.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </WindowCard>

          {/* TELEGRAM CONNECTION MODAL */}
          <RetroModal
            isOpen={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
            title="HUBUNGKAN BOT TELEGRAM"
            tag="TELEGRAM API"
            headerBg="blue"
            maxWidth="lg"
          >
            <div className="space-y-4">
              {/* Step 1: Open Bot Link */}
              <div className="p-3.5 rounded-xl border-2 border-brand-black bg-brand-ice space-y-2">
                <div className="flex items-center gap-2 font-heading font-extrabold text-xs text-brand-black">
                  <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <span>Buka Bot Telegram ArsipinAja:</span>
                </div>
                <div className="flex items-center justify-between gap-3 pl-7">
                  <a
                    href={TelegramService.getBotUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono font-bold text-sm text-brand-blue underline hover:text-brand-navy"
                  >
                    <span>@{TelegramService.getBotUsername()}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[11px] font-bold text-brand-secondary">
                    Klik tombol <b>START</b> di Telegram
                  </span>
                </div>
              </div>

              {/* Method 1: Auto Detection */}
              <div className="p-3.5 rounded-xl border-2 border-brand-black bg-white space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-heading font-extrabold text-xs text-brand-black">
                  <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    2A
                  </span>
                  <span>Cara Otomatis (Paling Mudah):</span>
                </div>
                <p className="text-xs text-brand-secondary pl-7 leading-relaxed">
                  Setelah klik <b>START</b> atau kirim pesan apa saja ke bot Telegram, klik tombol di bawah untuk menghubungkan akun secara otomatis.
                </p>
                <div className="pl-7 pt-1">
                  <RetroButton
                    variant="blue"
                    size="sm"
                    isLoading={isDetectingChat}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={handleAutoDetectTelegram}
                  >
                    Deteksi Akun Telegram Otomatis
                  </RetroButton>
                </div>
              </div>

              {/* Method 2: Manual Input */}
              <div className="p-3.5 rounded-xl border-2 border-brand-black bg-white space-y-2 shadow-xs">
                <div className="flex items-center gap-2 font-heading font-extrabold text-xs text-brand-black">
                  <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    2B
                  </span>
                  <span>Atau Masukkan Chat ID Manual:</span>
                </div>
                <p className="text-xs text-brand-secondary pl-7 leading-relaxed">
                  Dapatkan ID Telegram Anda melalui bot <code>@userinfobot</code> atau <code>@raw_data_bot</code> di Telegram.
                </p>
                <div className="pl-7 flex gap-2 pt-1">
                  <input
                    type="text"
                    value={manualChatIdInput}
                    onChange={(e) => setManualChatIdInput(e.target.value)}
                    placeholder="Contoh: 123456789"
                    className="flex-1 px-3 py-1.5 rounded-lg border-2 border-brand-black font-mono font-bold text-xs"
                  />
                  <RetroButton
                    variant="blue"
                    size="sm"
                    isLoading={isVerifying}
                    onClick={handleManualConnectTelegram}
                  >
                    Simpan &amp; Tes
                  </RetroButton>
                </div>
              </div>
            </div>
          </RetroModal>
        </div>
      )}

      {/* TAB 3: PREFERENCES */}
      {activeTab === 'preferences' && (
        <WindowCard title="PREFERENSI APLIKASI" tag="SYSTEM" headerBg="blue">
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Zona Waktu Default
              </label>
              <input
                type="text"
                value="Asia/Jakarta (WIB) — UTC+07:00"
                disabled
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs bg-neutral-100 font-mono font-bold"
              />
              <p className="text-[10px] text-brand-secondary mt-1">
                Seluruh deadline tugas dan notifikasi bot disinkronkan dengan WIB.
              </p>
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Tema & Visual Identity
              </label>
              <div className="p-3 rounded-lg border-2 border-brand-black bg-brand-ice/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-brand-black">Retro Blue Aesthetic</div>
                  <div className="text-[10px] text-brand-secondary">
                    Royal Blue, Sky Blue, Navy, Cyan, Ice Blue brutalist palette
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-black bg-brand-blue text-white">
                  AKTIF
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Tampilan Default Arsip
              </label>
              <select className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-bold bg-white">
                <option value="grid">Grid View (Kotak Kartu)</option>
                <option value="list">List View (Tabel Baris)</option>
              </select>
            </div>
          </div>
        </WindowCard>
      )}

      {/* TAB 4: STORAGE */}
      {activeTab === 'storage' && (
        <WindowCard title="PENGGUNAAN CLOUDFLARE R2 STORAGE" tag="STORAGE" headerBg="blue">
          <div className="space-y-4 max-w-lg">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                <span>Terpakai: {storageUsedMB.toFixed(1)} MB</span>
                <span>Kapasitas: {(storageQuotaMB / 1024).toFixed(0)} GB</span>
              </div>
              <div className="w-full bg-brand-ice border-2 border-brand-black rounded-full h-4 overflow-hidden">
                <div
                  className="bg-brand-blue h-full transition-all"
                  style={{ width: `${Math.max(4, storagePercentage)}%` }}
                />
              </div>
              <div className="text-[10px] text-brand-secondary font-mono mt-1 text-right">
                {storagePercentage}% kuota terpakai
              </div>
            </div>

            <div className="p-3.5 rounded-lg border-2 border-brand-black bg-brand-ice space-y-2 text-xs">
              <div className="font-heading font-extrabold text-brand-black">
                Penyimpanan Cloudflare R2 Ruang Berdua
              </div>
              <p className="text-brand-secondary leading-relaxed text-[11px]">
                Seluruh dokumen disimpan dengan aman pada bucket Cloudflare R2 dengan otorisasi ID Token Firebase. Akses terisolasi khusus akun kita berdua.
              </p>
            </div>
          </div>
        </WindowCard>
      )}
    </div>
  );
};
