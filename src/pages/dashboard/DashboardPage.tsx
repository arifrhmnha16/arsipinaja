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
  AlertTriangle,
  ArrowRight,
  Send,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ArchiveService } from '../../services/firestore/archiveService';
import { TaskService } from '../../services/firestore/taskService';
import { FolderItem, FileItem, TaskItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { SunMascot, StarburstBadge } from '../../components/ui/Mascots';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const userFolders = ArchiveService.getAllUserFolders(user.id);
    const userFiles = ArchiveService.getFiles(user.id, null, false);
    // Also include files in subfolders
    const allFiles = ArchiveService.getFavorites(user.id).files.concat(userFiles);
    // Deduplicate
    const uniqueFiles = Array.from(new Map(allFiles.map((f) => [f.id, f])).values());

    const userTasks = TaskService.getTasks(user.id);

    setFolders(userFolders);
    setFiles(uniqueFiles);
    setTasks(userTasks);
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
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const overdueTasks = tasks.filter((t) => TaskService.isOverdue(t));
  const todayTasks = tasks.filter((t) => TaskService.isDueToday(t) && t.status !== 'completed');

  // Nearest deadline task
  const upcomingTasks = [...activeTasks].sort((a, b) => {
    const da = new Date(`${a.deadlineDate}T${a.deadlineTime || '23:59'}`).getTime();
    const db = new Date(`${b.deadlineDate}T${b.deadlineTime || '23:59'}`).getTime();
    return da - db;
  });
  const nearestTask = upcomingTasks[0] || null;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section & Hero Window */}
      <div className="relative bg-brand-yellow rounded-2xl border-3 border-brand-black p-6 sm:p-8 shadow-retro-lg overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-graph-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-brand-black bg-white text-xs font-mono font-bold shadow-retro-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-green" />
              <span>
                {user?.university || 'Universitas'} • Semester {user?.semester || 1}
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-brand-black tracking-tight leading-tight">
              {getGreeting()},{' '}
              <span className="underline decoration-wavy decoration-brand-pink">
                {user?.name?.split(' ')[0] || 'Mahasiswa'}!
              </span>
            </h2>

            <p className="font-sans font-medium text-sm sm:text-base text-brand-black/85 leading-relaxed">
              Semua materi kuliah dan jadwal tugasmu terorganisasi rapi di satu tempat. Jangan biarkan deadline menumpuk!
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <RetroButton
                variant="green"
                size="md"
                leftIcon={<Upload className="w-4 h-4 stroke-[3]" />}
                onClick={() => navigate('/archive?action=upload')}
              >
                Upload Dokumen
              </RetroButton>
              <RetroButton
                variant="pink"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4 stroke-[3]" />}
                onClick={() => navigate('/tasks?action=create')}
              >
                Tambah Tugas
              </RetroButton>
              <RetroButton
                variant="white"
                size="md"
                leftIcon={<FolderPlus className="w-4 h-4 stroke-[3]" />}
                onClick={() => navigate('/archive?action=new-folder')}
              >
                Buat Folder
              </RetroButton>
            </div>
          </div>

          {/* Right Mascot Illustration */}
          <div className="relative flex-shrink-0">
            <SunMascot size={140} className="drop-shadow-[4px_4px_0px_#171717]" />
            <div className="absolute -bottom-2 -left-4">
              <StarburstBadge text="AKTIF" subtext="SEMESTER" bgColor="#00A968" textColor="#FFFFFF" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <WindowCard
          title="DOKUMEN"
          headerBg="yellow"
          shadow="sm"
          bodyClassName="p-4 bg-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-black text-brand-black">
                {files.length}
              </div>
              <div className="text-xs font-bold text-brand-secondary mt-0.5">
                Total File Tersimpan
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg border-2 border-brand-black bg-brand-yellow/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-black stroke-[2.5]" />
            </div>
          </div>
        </WindowCard>

        {/* Total Folders */}
        <WindowCard
          title="FOLDER"
          headerBg="green"
          shadow="sm"
          bodyClassName="p-4 bg-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-black text-brand-black">
                {folders.length}
              </div>
              <div className="text-xs font-bold text-brand-secondary mt-0.5">
                Struktur Mata Kuliah
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg border-2 border-brand-black bg-brand-green/20 flex items-center justify-center">
              <Folder className="w-5 h-5 text-brand-black stroke-[2.5]" />
            </div>
          </div>
        </WindowCard>

        {/* Active Tasks */}
        <WindowCard
          title="TUGAS AKTIF"
          headerBg="pink"
          shadow="sm"
          bodyClassName="p-4 bg-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-black text-brand-black">
                {activeTasks.length}
              </div>
              <div className="text-xs font-bold text-brand-secondary mt-0.5">
                Perlu Dikerjakan
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg border-2 border-brand-black bg-brand-pink/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-black stroke-[2.5]" />
            </div>
          </div>
        </WindowCard>

        {/* Overdue / Urgencies */}
        <WindowCard
          title="DEADLINE TERDEKAT"
          headerBg="blue"
          shadow="sm"
          bodyClassName="p-4 bg-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-display font-black text-brand-black truncate max-w-[120px]">
                {nearestTask ? nearestTask.deadlineDate : 'Nihil'}
              </div>
              <div className="text-xs font-bold text-brand-secondary mt-0.5 truncate">
                {nearestTask ? `${nearestTask.deadlineTime} WIB` : 'Semua Beres!'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg border-2 border-brand-black bg-brand-blue/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-brand-black stroke-[2.5]" />
            </div>
          </div>
        </WindowCard>
      </div>

      {/* 3. Task Overview & Recent Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Task Overview Section */}
        <div className="lg:col-span-7 space-y-4">
          <WindowCard
            title="PEMANTAU DEADLINE TUGAS"
            tag={`${activeTasks.length} AKTIF`}
            headerBg="cream"
            headerActions={
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-bold text-brand-black hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle className="w-12 h-12 text-brand-green mx-auto stroke-[2.5]" />
                <div className="font-heading font-extrabold text-base text-brand-black">
                  Tidak Ada Tugas Tertunda!
                </div>
                <p className="text-xs text-brand-secondary max-w-xs mx-auto">
                  Semua tugasmu telah selesai. Tambahkan tugas baru kapan saja.
                </p>
                <div className="pt-2">
                  <RetroButton
                    variant="yellow"
                    size="sm"
                    onClick={() => navigate('/tasks?action=create')}
                  >
                    Tambah Tugas Baru
                  </RetroButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.slice(0, 4).map((task) => {
                  const isOverdue = TaskService.isOverdue(task);
                  const isToday = TaskService.isDueToday(task);

                  const priorityColors = {
                    high: 'bg-brand-pink text-brand-black',
                    medium: 'bg-brand-yellow text-brand-black',
                    low: 'bg-brand-green text-white',
                  }[task.priority];

                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate('/tasks')}
                      className="p-3.5 rounded-lg border-2 border-brand-black bg-brand-cream/30 hover:bg-white transition-all shadow-retro-sm cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-brand-black ${priorityColors}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs font-bold text-brand-secondary truncate">
                            {task.subject}
                          </span>
                        </div>
                        <div className="font-heading font-extrabold text-sm text-brand-black truncate">
                          {task.title}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-xs font-bold font-mono px-2 py-1 rounded border border-brand-black ${
                            isOverdue
                              ? 'bg-brand-pink text-brand-black'
                              : isToday
                              ? 'bg-brand-yellow text-brand-black animate-pulse'
                              : 'bg-white text-brand-black'
                          }`}
                        >
                          {task.deadlineDate}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono mt-0.5">
                          {task.deadlineTime} WIB
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </WindowCard>
        </div>

        {/* Right: Recent Files & Telegram Alert */}
        <div className="lg:col-span-5 space-y-6">
          {/* Telegram Connection Widget */}
          <div className="p-4 rounded-xl border-3 border-brand-black bg-brand-blue text-white shadow-retro">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display font-bold text-base flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Notifikasi Bot Telegram</span>
                </div>
                <p className="text-xs text-white/90 mt-1 leading-relaxed">
                  {user?.telegramChatId
                    ? 'Akun Telegram Anda terhubung. Pengingat H-3, H-1, dan H-0 otomatis aktif.'
                    : 'Hubungkan akun Telegram untuk menerima pengingat deadline otomatis ke HP Anda.'}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <RetroButton
                variant={user?.telegramChatId ? 'cream' : 'yellow'}
                size="sm"
                onClick={() => navigate('/settings?tab=telegram')}
              >
                {user?.telegramChatId ? 'Kelola Preferensi Bot' : 'Hubungkan Telegram Sekarang'}
              </RetroButton>
            </div>
          </div>

          {/* Recent Documents */}
          <WindowCard
            title="DOKUMEN TERBARU"
            tag="RECENT"
            headerBg="yellow"
            headerActions={
              <button
                onClick={() => navigate('/archive')}
                className="text-xs font-bold text-brand-black hover:underline"
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
              <div className="space-y-2.5">
                {files.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => navigate('/archive')}
                    className="p-2.5 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-cream/50 transition-colors flex items-center justify-between gap-2 shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded border border-brand-black bg-brand-yellow/30 flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold uppercase">
                        {f.extension}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-brand-black truncate">
                          {f.fileName}
                        </div>
                        <div className="text-[10px] text-brand-secondary font-mono">
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
