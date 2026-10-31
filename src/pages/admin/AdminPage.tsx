import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  KeyRound,
  HardDrive,
  FileText,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { AuthService } from '../../services/auth/authService';
import { ArchiveService } from '../../services/firestore/archiveService';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { RetroModal } from '../../components/ui/RetroModal';

export const AdminPage: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newMajor, setNewMajor] = useState('');
  const [newSemester, setNewSemester] = useState(1);

  // Reset Password Modal
  const [resetModalUser, setResetModalUser] = useState<UserProfile | null>(null);
  const [generatedTempPass, setGeneratedTempPass] = useState<string | null>(null);

  // Delete User Modal
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    const allUsers = await AuthService.getAllUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (role !== 'admin') {
    return (
      <div className="bg-brand-ice border-3 border-brand-navy rounded-xl p-8 text-center space-y-3 shadow-retro">
        <Lock className="w-12 h-12 text-brand-navy mx-auto" />
        <h2 className="font-display font-black text-2xl text-brand-black">Akses Dibatasi</h2>
        <p className="text-xs text-brand-secondary max-w-md mx-auto">
          Halaman ini khusus untuk Admin Ruang Berdua. Anda tidak memiliki izin untuk mengakses menu ini.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchQuery && matchStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const totalStorageBytes = users.reduce((acc, u) => acc + (u.storageUsedBytes || 0), 0);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) {
      showToast('Kata sandi minimal 6 karakter.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await AuthService.adminCreateUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
        major: newMajor,
        semester: Number(newSemester),
      });
      showToast(`Akun untuk ${newName} berhasil dibuat!`, 'success');
      setIsCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setShowNewPassword(false);
      setNewMajor('');
      setNewSemester(1);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat pengguna.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: UserProfile) => {
    const nextStatus: UserStatus = targetUser.status === 'active' ? 'disabled' : 'active';
    try {
      await AuthService.adminToggleUserStatus(targetUser.id, nextStatus);
      showToast(
        `Akun ${targetUser.name} ${nextStatus === 'active' ? 'diaktifkan kembali' : 'dinonaktifkan'}.`,
        'info'
      );
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  const handleResetPassword = async (targetUser: UserProfile) => {
    const tempPass = await AuthService.adminResetPassword(targetUser.id, targetUser.email);
    setResetModalUser(targetUser);
    setGeneratedTempPass(tempPass);
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    try {
      await AuthService.adminDeleteUser(deleteConfirmUser.id);
      showToast(`Akun ${deleteConfirmUser.name} berhasil dihapus permanen.`, 'success');
      setDeleteConfirmUser(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus akun.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-2xl text-brand-black flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brand-blue" />
            <span>Kelola Akun Ruang Berdua</span>
          </h2>
          <p className="text-xs text-brand-secondary font-medium">
            Kelola akses kita berdua, pantau pemakaian kapasitas Cloudflare R2, dan kelola kata sandi.
          </p>
        </div>

        <RetroButton
          variant="blue"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4 stroke-[3]" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tambah Akun Partner
        </RetroButton>
      </div>

      {/* Admin Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WindowCard title="TOTAL AKUN" headerBg="blue" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-black">{totalUsers}</div>
              <div className="text-xs font-bold text-brand-secondary">Akun Terdaftar</div>
            </div>
            <Users className="w-8 h-8 text-brand-black stroke-[2.5]" />
          </div>
        </WindowCard>

        <WindowCard title="AKUN AKTIF" headerBg="blue" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-black">{activeUsers}</div>
              <div className="text-xs font-bold text-brand-secondary">Bisa Akses</div>
            </div>
            <CheckCircle className="w-8 h-8 text-brand-blue stroke-[2.5]" />
          </div>
        </WindowCard>

        <WindowCard title="STORAGE R2" headerBg="blue" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-display font-black">
                {(totalStorageBytes / (1024 * 1024)).toFixed(0)} MB
              </div>
              <div className="text-xs font-bold text-brand-secondary">Total Seluruh File</div>
            </div>
            <HardDrive className="w-8 h-8 text-brand-navy stroke-[2.5]" />
          </div>
        </WindowCard>

        <WindowCard title="STATUS RUANG" headerBg="blue" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-display font-black text-brand-blue">TERPROTEKSI</div>
              <div className="text-[11px] font-bold text-brand-secondary">Khusus Kita Berdua</div>
            </div>
            <Lock className="w-7 h-7 text-brand-black" />
          </div>
        </WindowCard>
      </div>

      {/* User Management Table */}
      <WindowCard
        title="DAFTAR AKUN KITA BERDUA"
        tag={`${filteredUsers.length} AKUN`}
        headerBg="blue"
      >
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-brand-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border-2 border-brand-black text-xs font-medium"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-brand-black rounded-lg px-3 py-1.5 bg-white text-xs font-bold cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="disabled">Dinonaktifkan</option>
            </select>
          </div>

          {/* Table */}
          <div className="border-2 border-brand-black rounded-xl overflow-x-auto bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-ice border-b-2 border-brand-black font-mono font-bold uppercase text-brand-black">
                <tr>
                  <th className="p-3">Nama Pengguna</th>
                  <th className="p-3">Email Akun</th>
                  <th className="p-3">Hak Akses</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Storage Digunakan</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/10">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-ice/30 transition-colors">
                    <td className="p-3 font-heading font-extrabold text-brand-black truncate max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center text-xs font-bold border border-brand-black flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-brand-black">{u.name}</div>
                          <div className="text-[10px] text-brand-secondary font-mono">
                            {u.role === 'admin' ? 'Akun Utama (Admin)' : 'Akun Partner'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-brand-secondary truncate max-w-[180px]">
                      {u.email}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-brand-black ${
                          u.role === 'admin'
                            ? 'bg-brand-navy text-white'
                            : 'bg-brand-ice text-brand-navy border-brand-navy/50'
                        }`}
                      >
                        {u.role === 'admin' ? 'ADMIN' : 'PARTNER'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-brand-black ${
                          u.status === 'active'
                            ? 'bg-brand-blue text-white'
                            : 'bg-brand-navy text-white'
                        }`}
                      >
                        {u.status === 'active' ? 'Aktif' : 'Dinonaktifkan'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      {((u.storageUsedBytes || 0) / (1024 * 1024)).toFixed(1)} MB
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="px-2.5 py-1 rounded border border-brand-black bg-white hover:bg-brand-ice font-bold text-[10px] text-brand-black shadow-xs cursor-pointer"
                          title="Reset Password Pengguna"
                        >
                          Reset Pass
                        </button>
                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`px-2.5 py-1 rounded border border-brand-black font-bold text-[10px] shadow-xs cursor-pointer ${
                                u.status === 'active'
                                  ? 'bg-brand-navy text-white hover:bg-brand-blue'
                                  : 'bg-brand-blue text-white hover:bg-brand-navy'
                              }`}
                            >
                              {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmUser(u)}
                              className="px-2 py-1 rounded border border-brand-black bg-red-100 hover:bg-red-500 hover:text-white text-red-700 font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </WindowCard>

      {/* MODAL: CREATE USER */}
      <RetroModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="TAMBAH AKUN PARTNER BARU"
        tag="AKUN"
        headerBg="blue"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Nama Pengguna / Partner
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: Nama Partner"
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
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="partner@arsipinaja.id"
              required
              className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-mono font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-heading font-extrabold uppercase">
                Kata Sandi (Password)
              </label>
              <span className="text-[10px] font-mono text-brand-secondary font-bold">Min. 6 Karakter</span>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Buat kata sandi akun..."
                required
                minLength={6}
                className="w-full pl-3 pr-10 py-2 rounded-lg border-2 border-brand-black text-xs font-mono font-medium focus:ring-2 focus:ring-brand-blue"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-black p-1 cursor-pointer transition-colors"
                title={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-brand-secondary mt-1 font-medium">
              💡 Partner bisa langsung login menggunakan email &amp; kata sandi ini.
            </p>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Hak Akses
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-bold bg-white"
            >
              <option value="user">Partner (User)</option>
              <option value="admin">Administrator (Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Catatan / Info Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={newMajor}
              onChange={(e) => setNewMajor(e.target.value)}
              placeholder="Contoh: Partner Belajar"
              className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-black/20">
            <RetroButton
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Batal
            </RetroButton>
            <RetroButton variant="blue" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Simpan & Buat Akun'}
            </RetroButton>
          </div>
        </form>
      </RetroModal>

      {/* MODAL: RESET PASSWORD SUCCESS */}
      {resetModalUser && (
        <RetroModal
          isOpen={Boolean(resetModalUser)}
          onClose={() => setResetModalUser(null)}
          title="RESET PASSWORD SUKSES"
          tag="SECURITY"
          headerBg="blue"
          maxWidth="md"
        >
          <div className="space-y-4 text-center">
            <KeyRound className="w-12 h-12 text-brand-blue mx-auto stroke-[2.5]" />
            <div>
              <div className="font-heading font-extrabold text-base text-brand-black">
                Password Sementara untuk {resetModalUser.name}
              </div>
              <p className="text-xs text-brand-secondary mt-1">
                Berikan password sementara ini kepada partnermu. Password dapat diganti setelah login.
              </p>
            </div>

            <div className="p-3 bg-brand-ice border-2 border-brand-black rounded-lg font-mono font-black text-lg tracking-wider text-brand-black select-all">
              {generatedTempPass}
            </div>

            <RetroButton
              variant="blue"
              size="sm"
              className="w-full"
              onClick={() => setResetModalUser(null)}
            >
              Tutup & Selesai
            </RetroButton>
          </div>
        </RetroModal>
      )}

      {/* MODAL: KONFIRMASI HAPUS AKUN */}
      {deleteConfirmUser && (
        <RetroModal
          isOpen={Boolean(deleteConfirmUser)}
          onClose={() => !isDeleting && setDeleteConfirmUser(null)}
          title="HAPUS AKUN PARTNER"
          tag="PERINGATAN"
          headerBg="blue"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 border-2 border-red-500 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <div className="font-heading font-extrabold text-sm text-red-900">
                  Tindakan Tidak Dapat Dibatalkan!
                </div>
                <div className="text-xs text-red-700 mt-0.5">
                  Akun ini akan dihapus permanen dari sistem Ruang Berdua.
                </div>
              </div>
            </div>

            <div className="p-3 bg-brand-ice border-2 border-brand-black rounded-lg space-y-1">
              <div className="text-[10px] font-bold text-brand-secondary uppercase font-mono">
                Detail Akun:
              </div>
              <div className="font-heading font-black text-sm text-brand-black">
                {deleteConfirmUser.name}
              </div>
              <div className="font-mono text-xs text-brand-blue font-bold">
                {deleteConfirmUser.email}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-brand-black/20">
              <RetroButton
                variant="outline"
                size="sm"
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmUser(null)}
              >
                Batal
              </RetroButton>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-lg border-2 border-brand-black bg-red-600 hover:bg-red-700 text-white font-heading font-bold uppercase text-xs shadow-retro flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}</span>
              </button>
            </div>
          </div>
        </RetroModal>
      )}
    </div>
  );
};
