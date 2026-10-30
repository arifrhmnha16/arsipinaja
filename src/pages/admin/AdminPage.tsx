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
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newMajor, setNewMajor] = useState('Teknik Informatika');
  const [newSemester, setNewSemester] = useState(1);

  // Reset Password Modal
  const [resetModalUser, setResetModalUser] = useState<UserProfile | null>(null);
  const [generatedTempPass, setGeneratedTempPass] = useState<string | null>(null);

  const loadData = () => {
    const allUsers = AuthService.getAllUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (role !== 'admin') {
    return (
      <div className="bg-brand-pink/20 border-3 border-brand-pink rounded-xl p-8 text-center space-y-3">
        <Lock className="w-12 h-12 text-brand-black mx-auto" />
        <h2 className="font-display font-black text-2xl text-brand-black">Akses Dibatasi</h2>
        <p className="text-xs text-brand-secondary max-w-md mx-auto">
          Halaman ini khusus untuk Administrator Kampus ArsipinAja. Anda tidak memiliki izin untuk mengakses menu ini.
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
    try {
      await AuthService.adminCreateUser({
        name: newName,
        email: newEmail,
        role: newRole,
        major: newMajor,
        semester: Number(newSemester),
      });
      showToast(`Akun untuk ${newName} berhasil dibuat!`, 'success');
      setIsCreateModalOpen(false);
      setNewName('');
      setNewEmail('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal membuat pengguna.', 'error');
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
    const tempPass = await AuthService.adminResetPassword(targetUser.id);
    setResetModalUser(targetUser);
    setGeneratedTempPass(tempPass);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-2xl text-brand-black flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-brand-pink" />
            <span>Panel Administrator ArsipinAja</span>
          </h2>
          <p className="text-xs text-brand-secondary font-medium">
            Kelola akun mahasiswa resmi, pantau utilisasi Cloudflare R2, dan kelola integritas sistem.
          </p>
        </div>

        <RetroButton
          variant="pink"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4 stroke-[3]" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Buat Akun Mahasiswa
        </RetroButton>
      </div>

      {/* Admin Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WindowCard title="TOTAL PENGGUNA" headerBg="pink" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-black">{totalUsers}</div>
              <div className="text-xs font-bold text-brand-secondary">Akun Terdaftar</div>
            </div>
            <Users className="w-8 h-8 text-brand-black stroke-[2.5]" />
          </div>
        </WindowCard>

        <WindowCard title="PENGGUNA AKTIF" headerBg="green" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-black">{activeUsers}</div>
              <div className="text-xs font-bold text-brand-secondary">Bisa Login</div>
            </div>
            <CheckCircle className="w-8 h-8 text-brand-green stroke-[2.5]" />
          </div>
        </WindowCard>

        <WindowCard title="STORAGE R2 DIGUNAKAN" headerBg="yellow" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-display font-black">
                {(totalStorageBytes / (1024 * 1024)).toFixed(0)} MB
              </div>
              <div className="text-xs font-bold text-brand-secondary">Total Seluruh Akun</div>
            </div>
            <HardDrive className="w-8 h-8 text-brand-black stroke-[2.5]" />
          </div>
        </WindowCard>

        <WindowCard title="PRIVASI MAHASISWA" headerBg="cream" shadow="sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-display font-black text-brand-green">TERISOLASI</div>
              <div className="text-[11px] font-bold text-brand-secondary">Zero-Knowledge Files</div>
            </div>
            <Lock className="w-7 h-7 text-brand-black" />
          </div>
        </WindowCard>
      </div>

      {/* User Management Table */}
      <WindowCard
        title="DAFTAR PENGGUNA & MAHASISWA"
        tag={`${filteredUsers.length} AKUN`}
        headerBg="cream"
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
              <thead className="bg-brand-cream border-b-2 border-brand-black font-mono font-bold uppercase text-brand-black">
                <tr>
                  <th className="p-3">Nama Mahasiswa</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Penggunaan Storage</th>
                  <th className="p-3 text-right">Aksi Administrator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/10">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-cream/20">
                    <td className="p-3 font-heading font-extrabold text-brand-black truncate max-w-[160px]">
                      {u.name}
                      {u.semester && (
                        <span className="block text-[10px] text-brand-secondary font-mono font-normal">
                          Semester {u.semester} • {u.major}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-brand-secondary truncate max-w-[180px]">
                      {u.email}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-brand-black ${
                          u.role === 'admin'
                            ? 'bg-brand-pink text-brand-black'
                            : 'bg-brand-cream text-brand-black'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-brand-black ${
                          u.status === 'active'
                            ? 'bg-brand-green text-white'
                            : 'bg-brand-pink text-brand-black'
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
                          className="px-2 py-1 rounded border border-brand-black bg-white hover:bg-brand-yellow font-bold text-[10px] shadow-xs"
                          title="Reset Password Pengguna"
                        >
                          Reset Pass
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2 py-1 rounded border border-brand-black font-bold text-[10px] shadow-xs ${
                              u.status === 'active'
                                ? 'bg-brand-pink hover:bg-brand-pink/80 text-brand-black'
                                : 'bg-brand-green hover:bg-brand-green/80 text-white'
                            }`}
                          >
                            {u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
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
        title="BUAT AKUN MAHASISWA BARU"
        tag="ADMIN"
        headerBg="pink"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Nama Mahasiswa
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: Muhammad Farhan"
              required
              className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Email Kampus
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="farhan@mahasiswa.ac.id"
              required
              className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-mono font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Role Akun
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-bold bg-white"
              >
                <option value="user">Mahasiswa (User)</option>
                <option value="admin">Administrator (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold uppercase mb-1">
                Semester Masuk
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={newSemester}
                onChange={(e) => setNewSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border-2 border-brand-black text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-extrabold uppercase mb-1">
              Program Studi / Jurusan
            </label>
            <input
              type="text"
              value={newMajor}
              onChange={(e) => setNewMajor(e.target.value)}
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
            <RetroButton variant="pink" size="sm" type="submit">
              Buat Akun
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
          headerBg="yellow"
          maxWidth="md"
        >
          <div className="space-y-4 text-center">
            <KeyRound className="w-12 h-12 text-brand-green mx-auto stroke-[2.5]" />
            <div>
              <div className="font-heading font-extrabold text-base text-brand-black">
                Password Sementara untuk {resetModalUser.name}
              </div>
              <p className="text-xs text-brand-secondary mt-1">
                Berikan password sementara ini kepada mahasiswa. Mahasiswa dapat menggantinya setelah login.
              </p>
            </div>

            <div className="p-3 bg-brand-cream border-2 border-brand-black rounded-lg font-mono font-black text-lg tracking-wider text-brand-black select-all">
              {generatedTempPass}
            </div>

            <RetroButton
              variant="yellow"
              size="sm"
              className="w-full"
              onClick={() => setResetModalUser(null)}
            >
              Tutup & Selesai
            </RetroButton>
          </div>
        </RetroModal>
      )}
    </div>
  );
};
