import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { SunMascot, CheckerboardDivider } from '../../components/ui/Mascots';
import { RetroModal } from '../../components/ui/RetroModal';
import { AppLogo } from '../../components/ui/AppLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi email dan kata sandi Anda.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      showToast(`Selamat datang kembali, ${user.name}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setErrorMessage('Email atau kata sandi tidak cocok. Periksa kembali penulisan email dan kata sandi Anda.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage('Terlalu banyak percobaan gagal. Silakan tunggu sebentar sebelum mencoba lagi.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMessage('Koneksi internet bermasalah. Periksa jaringan Anda.');
      } else {
        setErrorMessage(err.message || 'Login gagal. Periksa email dan password Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] via-[#F0F7FF] to-[#DCEBFE] flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      {/* Top Retro Checkerboard Divider */}
      <CheckerboardDivider variant="blue" height={16} />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Playful Branding & Clean Retro Character */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border-2 border-brand-black rounded-xl flex items-center justify-center shadow-retro-sm p-1">
                <AppLogo size={34} />
              </div>
              <span className="font-display font-black text-2xl text-brand-black tracking-tight">
                ArsipinAja
              </span>
            </div>

            <div className="relative">
              <SunMascot size={110} className="animate-wobble-slow" />
            </div>

            <div>
              <p className="font-display font-bold text-lg sm:text-xl text-brand-blue">
                "Biar Kuliah & Hidup Kita Nggak Berantakan."
              </p>
            </div>

            <p className="text-sm font-medium text-brand-secondary max-w-md leading-relaxed">
              Ruang arsip dokumen, materi kuliah, catatan bersama, dan pemantau jadwal deadline tugas untuk kita berdua.
            </p>
          </div>

          {/* Right Column: Retro Browser Window Login Form */}
          <div className="lg:col-span-6">
            <WindowCard
              title="LOGIN RUANG BERDUA"
              headerBg="blue"
              bodyBg="bg-white"
              shadow="lg"
            >
              <form onSubmit={handleLogin} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-brand-sky/20 border-2 border-brand-blue rounded-lg flex items-start gap-2.5 text-xs font-bold text-brand-black">
                    <AlertCircle className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-brand-black mb-1.5">
                    Email Akun
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-brand-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@kamu.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-brand-black bg-brand-ice/40 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-brand-black mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-lg border-2 border-brand-black bg-brand-ice/40 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-black"
                      aria-label="Tampilkan Password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-medium">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-brand-black text-brand-blue focus:ring-0 cursor-pointer"
                    />
                    <span className="font-bold text-brand-black">Ingat saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="font-bold text-brand-blue hover:underline"
                  >
                    Lupa password?
                  </button>
                </div>

                <RetroButton
                  type="submit"
                  variant="blue"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4 stroke-[3]" />}
                  className="w-full mt-2"
                >
                  Masuk Sekarang
                </RetroButton>

                <div className="pt-2 border-t-2 border-brand-black/20 text-center">
                  <p className="text-xs text-brand-secondary">
                    Ruang privat khusus untuk kita berdua.
                  </p>
                </div>
              </form>
            </WindowCard>
          </div>
        </div>
      </div>

      {/* Bottom Retro Checkerboard Divider */}
      <CheckerboardDivider variant="blue" height={16} />

      {/* Forgot Password Modal */}
      <RetroModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="RESET PASSWORD"
        tag="SECURITY"
        headerBg="blue"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-brand-secondary leading-relaxed">
            Masukkan email terdaftar Anda. Tautan pemulihan kata sandi akan dikirimkan ke email Anda atau dapat direset langsung oleh Administrator.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Email Anda</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="partner@arsipinaja.id"
              className="w-full px-3.5 py-2 rounded-lg border-2 border-brand-black text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <RetroButton
              variant="outline"
              size="sm"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Batal
            </RetroButton>
            <RetroButton
              variant="blue"
              size="sm"
              onClick={() => {
                showToast('Instruksi reset password telah dikirim ke email.', 'success');
                setIsForgotModalOpen(false);
              }}
            >
              Kirim Permintaan
            </RetroButton>
          </div>
        </div>
      </RetroModal>

      {/* Bottom Checkerboard Accent */}
      <CheckerboardDivider variant="blue" height={16} />
    </div>
  );
};
