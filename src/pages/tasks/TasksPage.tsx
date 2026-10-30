import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  CheckSquare,
  Paperclip,
  Send,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { TaskService } from '../../services/firestore/taskService';
import { ArchiveService } from '../../services/firestore/archiveService';
import { TelegramService } from '../../services/telegram/telegramService';
import { TaskItem, TaskPriority, TaskStatus, TaskChecklistItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { RetroModal } from '../../components/ui/RetroModal';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formFolderId, setFormFolderId] = useState<string | null>(null);
  const [formDeadlineDate, setFormDeadlineDate] = useState('');
  const [formDeadlineTime, setFormDeadlineTime] = useState('23:59');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formNotes, setFormNotes] = useState('');
  const [checklistItems, setChecklistItems] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Delete Confirmation Modal
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);

  const loadTasks = () => {
    if (!user) return;
    const all = TaskService.getTasks(user.id);
    const subs = TaskService.getSubjects(user.id);
    setTasks(all);
    setSubjects(subs);
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  // Open modal if ?action=create in URL
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      handleOpenCreateModal();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = selectedSubject === 'all' || t.subject === selectedSubject;
    const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchSearch && matchSubject && matchPriority && matchStatus;
  });

  // Sort: closest deadline first
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const da = new Date(`${a.deadlineDate}T${a.deadlineTime || '23:59'}`).getTime();
    const db = new Date(`${b.deadlineDate}T${b.deadlineTime || '23:59'}`).getTime();
    return da - db;
  });

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setFormTitle('');
    setFormDescription('');
    setFormSubject(subjects[0] || 'Algoritma Pemrograman');
    setFormFolderId(null);
    // Sensible default date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDeadlineDate(tomorrow.toISOString().split('T')[0]);
    setFormDeadlineTime('23:59');
    setFormPriority('medium');
    setFormNotes('');
    setChecklistItems([]);
    setNewChecklistText('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: TaskItem) => {
    setEditingTaskId(t.id);
    setFormTitle(t.title);
    setFormDescription(t.description);
    setFormSubject(t.subject);
    setFormFolderId(t.folderId || null);
    setFormDeadlineDate(t.deadlineDate);
    setFormDeadlineTime(t.deadlineTime || '23:59');
    setFormPriority(t.priority);
    setFormNotes(t.notes || '');
    setChecklistItems(t.checklist || []);
    setNewChecklistText('');
    setIsModalOpen(true);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      {
        id: 'c_' + Date.now(),
        title: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter((c) => c.id !== id));
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formTitle.trim() || !formSubject.trim() || !formDeadlineDate) return;

    if (editingTaskId) {
      TaskService.updateTask(editingTaskId, {
        title: formTitle,
        description: formDescription,
        subject: formSubject,
        folderId: formFolderId,
        deadlineDate: formDeadlineDate,
        deadlineTime: formDeadlineTime,
        priority: formPriority,
        notes: formNotes,
        checklist: checklistItems,
      });
      showToast('Tugas berhasil diperbarui!', 'success');
    } else {
      TaskService.createTask({
        userId: user.id,
        title: formTitle,
        description: formDescription,
        subject: formSubject,
        folderId: formFolderId,
        deadlineDate: formDeadlineDate,
        deadlineTime: formDeadlineTime,
        priority: formPriority,
        checklist: checklistItems,
        notes: formNotes,
      });
      showToast('Tugas baru berhasil ditambahkan!', 'success');
    }

    setIsModalOpen(false);
    loadTasks();
  };

  const handleToggleTaskStatus = (t: TaskItem) => {
    const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
    TaskService.toggleStatus(t.id, nextStatus);
    showToast(
      nextStatus === 'completed' ? 'Tugas ditandai selesai! 🎉' : 'Status tugas dikembalikan ke To Do',
      'info'
    );
    loadTasks();
  };

  const handleToggleChecklist = (taskId: string, checklistId: string) => {
    TaskService.toggleChecklistItem(taskId, checklistId);
    loadTasks();
  };

  const handleDeleteConfirm = () => {
    if (!taskToDelete) return;
    TaskService.deleteTask(taskToDelete.id);
    showToast('Tugas berhasil dihapus.', 'info');
    setTaskToDelete(null);
    loadTasks();
  };

  const handleSendTelegramTest = async (t: TaskItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.telegramChatId) {
      showToast('Akun Telegram Anda belum terhubung. Buka Pengaturan untuk menghubungkan.', 'error');
      return;
    }
    const res = await TelegramService.sendTestTelegramReminder(user.telegramChatId, t);
    showToast(res.message, 'success');
  };

  // Associated folders for subject linking
  const availableFolders = user ? ArchiveService.getAllUserFolders(user.id) : [];

  return (
    <div className="space-y-6">
      {/* 1. Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-2xl text-brand-black">
            Manajemen Tugas & Deadline
          </h2>
          <p className="text-xs text-brand-secondary font-medium">
            Pantau progres tugas kuliah dan atur pengingat notifikasi Telegram otomatis.
          </p>
        </div>

        <RetroButton
          variant="yellow"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4 stroke-[3]" />}
          onClick={handleOpenCreateModal}
        >
          Tambah Tugas Baru
        </RetroButton>
      </div>

      {/* 2. Filter & Search Panel */}
      <div className="bg-white border-2 border-brand-black p-4 rounded-xl shadow-retro-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul tugas..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border-2 border-brand-black bg-brand-cream/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          {/* Filter Subject */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border-2 border-brand-black rounded-lg px-3 py-1.5 bg-white text-xs font-bold cursor-pointer focus:outline-none"
          >
            <option value="all">Semua Mata Kuliah</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Filter Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border-2 border-brand-black rounded-lg px-3 py-1.5 bg-white text-xs font-bold cursor-pointer focus:outline-none"
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">🔥 Tinggi (High)</option>
            <option value="medium">⚡ Sedang (Medium)</option>
            <option value="low">🌱 Rendah (Low)</option>
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border-2 border-brand-black rounded-lg px-3 py-1.5 bg-white text-xs font-bold cursor-pointer focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="todo">Belum Dimulai (To Do)</option>
            <option value="in_progress">Sedang Dikerjakan</option>
            <option value="completed">Selesai (Completed)</option>
          </select>
        </div>
      </div>

      {/* 3. Empty State */}
      {sortedTasks.length === 0 && (
        <div className="bg-white border-3 border-brand-black rounded-2xl p-8 sm:p-12 text-center space-y-3 shadow-retro">
          <CheckSquare className="w-12 h-12 text-brand-green mx-auto stroke-[2.5]" />
          <h3 className="font-display font-black text-2xl text-brand-black">
            Tidak Ada Tugas yang Cocok.
          </h3>
          <p className="text-xs text-brand-secondary max-w-sm mx-auto">
            Semua tugas selesai atau filter pencarian tidak menemukan hasil.
          </p>
          <div className="pt-2">
            <RetroButton variant="yellow" size="sm" onClick={handleOpenCreateModal}>
              Tambah Tugas
            </RetroButton>
          </div>
        </div>
      )}

      {/* 4. Tasks List */}
      <div className="space-y-4">
        {sortedTasks.map((task) => {
          const isOverdue = TaskService.isOverdue(task);
          const isToday = TaskService.isDueToday(task);
          const isCompleted = task.status === 'completed';

          const priorityBadge = {
            high: 'bg-brand-pink text-brand-black border-brand-black',
            medium: 'bg-brand-yellow text-brand-black border-brand-black',
            low: 'bg-brand-green text-white border-brand-black',
          }[task.priority];

          const completedCount = task.checklist.filter((c) => c.completed).length;
          const totalChecklist = task.checklist.length;

          return (
            <div
              key={task.id}
              className={`rounded-xl border-3 border-brand-black p-4 sm:p-5 transition-all shadow-retro-sm hover:shadow-retro bg-white ${
                isCompleted ? 'bg-neutral-50/80 opacity-85' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Checkbox & Title */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="mt-0.5 text-brand-black hover:text-brand-green transition-colors cursor-pointer flex-shrink-0"
                    title={isCompleted ? 'Batalkan Selesai' : 'Tandai Selesai'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-brand-green fill-brand-green/20 stroke-[2.5]" />
                    ) : (
                      <Circle className="w-6 h-6 stroke-[2.5] text-brand-secondary" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${priorityBadge}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs font-bold text-brand-secondary">
                        {task.subject}
                      </span>
                      {task.folderId && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-brand-black bg-brand-cream">
                          📁 Linked
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-heading font-black text-base sm:text-lg text-brand-black ${
                        isCompleted ? 'line-through text-brand-secondary' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-brand-secondary mt-1 font-medium leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Deadline Badge & Quick Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-black/10">
                  <div className="text-left sm:text-right">
                    <div
                      className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded border-2 border-brand-black shadow-xs ${
                        isCompleted
                          ? 'bg-neutral-100 text-brand-secondary'
                          : isOverdue
                          ? 'bg-brand-pink text-brand-black animate-pulse'
                          : isToday
                          ? 'bg-brand-yellow text-brand-black'
                          : 'bg-white text-brand-black'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.deadlineDate}</span>
                    </div>
                    <div className="text-[10px] text-brand-secondary font-mono mt-0.5">
                      Pukul {task.deadlineTime} WIB
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Send Telegram Test Button */}
                    <button
                      onClick={(e) => handleSendTelegramTest(task, e)}
                      className="p-1.5 rounded-lg border-2 border-brand-black bg-brand-blue/15 hover:bg-brand-blue text-brand-black hover:text-white transition-colors"
                      title="Kirim Tes Pengingat Telegram Bot"
                    >
                      <Send className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-cream text-brand-black transition-colors"
                      title="Edit Tugas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-pink text-brand-black transition-colors"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Checklist Section inside Card */}
              {totalChecklist > 0 && (
                <div className="mt-3.5 pt-3 border-t border-brand-black/15">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-brand-secondary mb-2">
                    <span>
                      Checklist ({completedCount}/{totalChecklist})
                    </span>
                    <span className="text-[11px]">
                      {Math.round((completedCount / totalChecklist) * 100)}% selesai
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 p-1.5 rounded bg-brand-cream/40 border border-brand-black/20 text-xs cursor-pointer select-none hover:bg-brand-cream"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(task.id, item.id)}
                          className="w-3.5 h-3.5 rounded border border-brand-black text-brand-green focus:ring-0 cursor-pointer"
                        />
                        <span className={`truncate ${item.completed ? 'line-through text-brand-secondary' : 'font-medium'}`}>
                          {item.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT TASK MODAL */}
      <RetroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTaskId ? 'EDIT TUGAS KULIAH' : 'TAMBAH TUGAS KULIAH BARU'}
        tag="DEADLINE"
        headerBg="yellow"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitTask} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Judul Tugas
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Contoh: Membuat Flowchart Algoritma Pemrograman"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border-2 border-brand-black text-sm font-medium focus:ring-2 focus:ring-brand-yellow focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Mata Kuliah (Subject)
              </label>
              <input
                type="text"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="Contoh: Algoritma Pemrograman"
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Tautkan Folder Materi
              </label>
              <select
                value={formFolderId || ''}
                onChange={(e) => setFormFolderId(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs bg-white cursor-pointer"
              >
                <option value="">-- Tanpa Tautan Folder --</option>
                {availableFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📂 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Tanggal Deadline
              </label>
              <input
                type="date"
                value={formDeadlineDate}
                onChange={(e) => setFormDeadlineDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Jam Deadline (WIB)
              </label>
              <input
                type="time"
                value={formDeadlineTime}
                onChange={(e) => setFormDeadlineTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Prioritas Tugas
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-bold bg-white"
              >
                <option value="high">🔥 Tinggi (High)</option>
                <option value="medium">⚡ Sedang (Medium)</option>
                <option value="low">🌱 Rendah (Low)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Deskripsi / Petunjuk Pengerjaan
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Instruksi tugas, format pengumpulan, tautan materi..."
              className="w-full px-3.5 py-2 rounded-lg border-2 border-brand-black text-xs"
            />
          </div>

          {/* Checklist Builder */}
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Checklist Langkah Pengerjaan
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Tambah butir checklist (misal: Gambar diagram)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border-2 border-brand-black"
              />
              <RetroButton
                variant="white"
                size="sm"
                type="button"
                onClick={handleAddChecklistItem}
              >
                + Tambah
              </RetroButton>
            </div>

            {checklistItems.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-lg border border-brand-black bg-brand-cream/30">
                {checklistItems.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 p-1 rounded bg-white border border-brand-black text-xs"
                  >
                    <span className="truncate">{c.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(c.id)}
                      className="text-brand-pink hover:text-black p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-brand-black/20">
            <RetroButton
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </RetroButton>
            <RetroButton variant="yellow" size="sm" type="submit">
              {editingTaskId ? 'Simpan Perubahan' : 'Buat Tugas'}
            </RetroButton>
          </div>
        </form>
      </RetroModal>

      {/* CONFIRM DELETE MODAL */}
      <RetroModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        title="KONFIRMASI HAPUS TUGAS"
        tag="DELETE"
        headerBg="pink"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-brand-black font-medium leading-relaxed">
            Apakah Anda yakin ingin menghapus tugas{' '}
            <span className="font-bold">"{taskToDelete?.title}"</span>? Tindakan ini tidak dapat
            dibatalkan.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <RetroButton variant="outline" size="sm" onClick={() => setTaskToDelete(null)}>
              Batal
            </RetroButton>
            <RetroButton variant="pink" size="sm" onClick={handleDeleteConfirm}>
              Hapus Tugas
            </RetroButton>
          </div>
        </div>
      </RetroModal>
    </div>
  );
};
