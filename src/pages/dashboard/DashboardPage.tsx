import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Upload,
  PlusCircle,
  FileText,
  Folder,
  CheckCircle,
  Clock,
  ArrowRight,
  Send,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ArchiveService } from '../../services/firestore/archiveService';
import { TaskService } from '../../services/firestore/taskService';
import { FolderItem, FileItem, TaskItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { SunMascot } from '../../components/ui/Mascots';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      const [userFolders, userFiles, userTasks] = await Promise.all([
        ArchiveService.getAllUserFolders(user.id),
        ArchiveService.getFiles(user.id, null, false),
        TaskService.getTasks(user.id),
      ]);

      setFolders(userFolders);
      setFiles(userFiles);
      setTasks(userTasks);
    };

    fetchDashboardData();
  }, [user]);

  // Indonesian time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Task statistics
  const activeTasks = tasks.filter((t) => t.status !== 'completed');

  // Nearest deadline task
  const upcomingTasks = [...activeTasks].sort((a, b) => {
    const da = new Date(`${a.deadlineDate}T${a.deadlineTime || '23:59'}`).getTime();
    const db = new Date(`${b.deadlineDate}T${b.deadlineTime || '23:59'}`).getTime();
    return da - db;
  });
  const nearestTask = upcomingTasks[0] || null;

  // Format deadline for card without overflowing
  const getDeadlineCardInfo = (task: TaskItem | null) => {
    if (!task) {
      return { primary: 'Semua Beres! ✨', secondary: 'Tidak ada deadline aktif' };
    }
    if (TaskService.isOverdue(task)) {
      return { primary: 'Lewat Deadline', secondary: `${task.deadlineDate}` };
    }
    if (TaskService.isDueToday(task)) {
      return { primary: 'Hari Ini 🔥', secondary: `${task.deadlineTime || '23:59'} WIB` };
    }
    return { primary: task.deadlineDate, secondary: `${task.deadlineTime || '23:59'} WIB` };
  };

  const deadlineInfo = getDeadlineCardInfo(nearestTask);

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* 1. Welcome Section & Hero Banner */}
      <div className="relative bg-gradient-to-r from-brand-blue via-[#1D4ED8] to-[#0EA5E9] rounded-2xl border-3 border-brand-black p-4 sm:p-7 shadow-retro-lg overflow-hidden text-white min-w-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-graph-pattern opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border-2 border-brand-black bg-white text-brand-blue text-[11px] font-mono font-bold shadow-retro-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ruang Kuliah Berdua • {user?.name?.split(' ')[0] || 'Kita'}</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight truncate">
              {getGreeting()},{' '}
              <span className="underline decoration-wavy decoration-brand-sky">
                {user?.name?.split(' ')[0] || 'Kamu'}!
              </span>
            </h2>

            <p className="font-sans font-medium text-xs sm:text-sm text-blue-100 leading-relaxed max-w-md">
              Ruang arsip dokumen, materi kuliah, dan pemantau deadline tugas kita berdua.
            </p>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2.5 pt-2">
              <RetroButton
                variant="white"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5 stroke-[3]" />}
                onClick={() => navigate('/archive?action=upload')}
                className="text-[11px] sm:text-xs py-1.5 px-2 sm:px-3 text-center truncate"
              >
                Upload
              </RetroButton>
              <RetroButton
                variant="blue"
                size="sm"
                leftIcon={<PlusCircle className="w-3.5 h-3.5 stroke-[3]" />}
                onClick={() => navigate('/tasks?action=create')}
                className="text-[11px] sm:text-xs py-1.5 px-2 sm:px-3 text-center truncate"
              >
                + Tugas
              </RetroButton>
              <RetroButton
                variant="white"
                size="sm"
                leftIcon={<FolderPlus className="w-3.5 h-3.5 stroke-[3]" />}
                onClick={() => navigate('/archive?action=new-folder')}
                className="text-[11px] sm:text-xs py-1.5 px-2 sm:px-3 text-center truncate"
              >
                + Folder
              </RetroButton>
            </div>
          </div>

          {/* Right Mascot - Scaled down neatly so real data is prioritised */}
          <div className="hidden sm:block flex-shrink-0">
            <SunMascot size={105} className="drop-shadow-[3px_3px_0px_#171717]" />
          </div>
        </div>
      </div>

      {/* 2. Key Statistics Cards Grid - Clean Neo-brutalist (No faux window chrome on tiny cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 min-w-0">
        {/* Total Documents */}
        <div className="p-3.5 sm:p-4 rounded-xl border-2 sm:border-3 border-brand-black bg-white shadow-retro-sm flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-brand-secondary truncate">
              Dokumen
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-brand-black bg-brand-ice flex items-center justify-center flex-shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-navy stroke-[2.5]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-display font-black text-brand-black leading-none">
              {files.length}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-brand-secondary mt-1 truncate">
              File tersimpan
            </div>
          </div>
        </div>

        {/* Total Folders */}
        <div className="p-3.5 sm:p-4 rounded-xl border-2 sm:border-3 border-brand-black bg-white shadow-retro-sm flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-brand-secondary truncate">
              Folder
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-brand-black bg-brand-ice flex items-center justify-center flex-shrink-0">
              <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-navy stroke-[2.5]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-display font-black text-brand-black leading-none">
              {folders.length}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-brand-secondary mt-1 truncate">
              Kategori kuliah
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="p-3.5 sm:p-4 rounded-xl border-2 sm:border-3 border-brand-black bg-white shadow-retro-sm flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-brand-secondary truncate">
              Tugas Aktif
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-brand-black bg-brand-sky/30 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-black stroke-[2.5]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-display font-black text-brand-black leading-none">
              {activeTasks.length}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-brand-secondary mt-1 truncate">
              Perlu dikerjakan
            </div>
          </div>
        </div>

        {/* Nearest Deadline */}
        <div className="p-3.5 sm:p-4 rounded-xl border-2 sm:border-3 border-brand-black bg-white shadow-retro-sm flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-brand-secondary truncate">
              Deadline Terdekat
            </span>
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-brand-black flex items-center justify-center flex-shrink-0 ${
                nearestTask && (TaskService.isOverdue(nearestTask) || TaskService.isDueToday(nearestTask))
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-brand-ice text-brand-navy'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-display font-black text-brand-black truncate">
              {deadlineInfo.primary}
            </div>
            <div className="text-[10px] sm:text-[11px] font-mono text-brand-secondary mt-1 truncate">
              {deadlineInfo.secondary}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout (Task Monitor & Right Sidebar Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        {/* Left: Task Deadline Monitor */}
        <div className="lg:col-span-7 min-w-0">
          <WindowCard
            title="DEADLINE TUGAS"
            headerBg="blue"
            headerActions={
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Semua Tugas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-6 sm:py-8 space-y-2">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-brand-blue mx-auto stroke-[2.5]" />
                <div className="font-heading font-extrabold text-sm sm:text-base text-brand-black">
                  Tidak Ada Tugas Tertunda!
                </div>
                <p className="text-xs text-brand-secondary max-w-xs mx-auto">
                  Semua tugasmu telah selesai. Tambahkan tugas baru kapan saja.
                </p>
                <div className="pt-2">
                  <RetroButton
                    variant="blue"
                    size="sm"
                    onClick={() => navigate('/tasks?action=create')}
                  >
                    Tambah Tugas Baru
                  </RetroButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.slice(0, 4).map((task) => {
                  const isOverdue = TaskService.isOverdue(task);
                  const isToday = TaskService.isDueToday(task);

                  const priorityColors = {
                    high: 'bg-brand-navy text-white',
                    medium: 'bg-brand-sky text-brand-black',
                    low: 'bg-brand-ice text-brand-black',
                  }[task.priority];

                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate('/tasks')}
                      className="p-3 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-ice/30 transition-all shadow-retro-sm cursor-pointer flex items-center justify-between gap-3 min-w-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border border-brand-black ${priorityColors}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs font-bold text-brand-secondary truncate max-w-[140px] sm:max-w-[200px]">
                            {task.subject}
                          </span>
                        </div>
                        <div className="font-heading font-extrabold text-xs sm:text-sm text-brand-black truncate min-w-0">
                          {task.title}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border border-brand-black ${
                            isOverdue
                              ? 'bg-brand-navy text-white'
                              : isToday
                              ? 'bg-brand-sky text-brand-black'
                              : 'bg-brand-ice text-brand-black'
                          }`}
                        >
                          {task.deadlineDate}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono mt-0.5">
                          {task.deadlineTime || '23:59'} WIB
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </WindowCard>
        </div>

        {/* Right: Telegram Notification & Recent Documents */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 min-w-0">
          {/* Telegram Connection Card */}
          <div className="p-4 rounded-xl border-3 border-brand-black bg-white shadow-retro min-w-0">
            <div className="flex items-start justify-between gap-2.5">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-heading font-extrabold text-sm text-brand-black flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-blue flex-shrink-0" />
                  <span className="truncate">Notifikasi Bot Telegram</span>
                </div>
                <p className="text-xs text-brand-secondary leading-relaxed">
                  {user?.telegramChatId
                    ? 'Pengingat otomatis H-3, H-1, dan hari-H aktif ke akun Telegram Anda.'
                    : 'Hubungkan bot Telegram untuk menerima pengingat deadline otomatis ke HP.'}
                </p>
              </div>

              {user?.telegramChatId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-brand-black bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex-shrink-0">
                  <CheckCheck className="w-3 h-3" />
                  <span>Aktif</span>
                </span>
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-brand-black/10">
              <RetroButton
                variant={user?.telegramChatId ? 'white' : 'blue'}
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/settings?tab=telegram')}
              >
                {user?.telegramChatId ? 'Pengaturan Notifikasi' : 'Hubungkan Telegram'}
              </RetroButton>
            </div>
          </div>

          {/* Recent Documents */}
          <WindowCard
            title="DOKUMEN TERBARU"
            headerBg="blue"
            headerActions={
              <button
                onClick={() => navigate('/archive')}
                className="text-xs font-bold text-white hover:underline cursor-pointer"
              >
                Lihat Arsip
              </button>
            }
          >
            {files.length === 0 ? (
              <div className="text-center py-6 text-xs text-brand-secondary">
                Belum ada dokumen tersimpan.
              </div>
            ) : (
              <div className="space-y-2">
                {files.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => navigate('/archive')}
                    className="p-2.5 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-ice/40 transition-colors flex items-center justify-between gap-2.5 shadow-xs cursor-pointer min-w-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded border border-brand-black bg-brand-ice text-brand-navy flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold uppercase">
                        {f.extension}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-brand-black truncate">
                          {f.fileName}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono truncate">
                          {(f.fileSize / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </WindowCard>
        </div>
      </div>
    </div>
  );
};
