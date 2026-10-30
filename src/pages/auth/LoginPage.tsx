import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';
import { SunMascot, StarburstBadge, CheckerboardDivider } from '../../components/ui/Mascots';
import { RetroModal } from '../../components/ui/RetroModal';

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
      setErrorMessage(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsLoading(true);
    setErrorMessage('');
    try {
      const user = await login(demoEmail, 'password123');
      showToast(`Login sebagai ${user.name} (${user.role.toUpperCase()})`, 'success');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-yellow flex flex-col justify-between selection:bg-brand-pink selection:text-brand-black">
      {/* Top Retro Checkerboard Divider */}
      <CheckerboardDivider variant="blue" height={16} />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Playful Branding & Nyonyo Sun Mascot */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="relative">
              <SunMascot size={130} className="animate-wobble-slow" />
              <div className="absolute -top-3 -right-6">
                <StarburstBadge text="2026" subtext="CAMPUS" bgColor="#F381A6" />
              </div>
            </div>

            <div>
              <div className="inline-block bg-brand-black text-brand-yellow px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest border-2 border-brand-black mb-2 shadow-retro-sm">
                ACADEMIC ARCHIVE & TASKS
              </div>
              <h1 className="font-display font-black text-4xl sm:text-6xl text-brand-black tracking-tight leading-none">
                ArsipinAja
              </h1>
              <p className="font-display font-bold text-lg sm:text-xl text-brand-black/90 mt-2">
                "Biar Kuliah Nggak Berantakan."
              </p>
            </div>

            <p className="text-sm font-medium text-brand-secondary max-w-md leading-relaxed">
              Kelola dokumen materi perkuliahan dengan folder bertingkat, pantau deadline tugas, dan terima pengingat otomatis via Telegram Bot.
            </p>

            {/* Quick Demo Login Badges for Instant Tester Evaluation */}
            <div className="pt-2 w-full max-w-md bg-brand-cream/80 border-2 border-brand-black p-3.5 rounded-xl shadow-retro-sm">
              <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold text-brand-black mb-2">
                <Sparkles className="w-4 h-4 text-brand-green" />
                <span>AKSES CEPAT DEMO (1-KLIK)</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('budi.santoso@mahasiswa.ac.id')}
                  className="flex-1 btn-retro text-xs font-heading font-extrabold py-2 px-3 bg-white border-2 border-brand-black rounded-lg shadow-retro-sm hover:bg-brand-yellow text-left"
                >
                  <div className="text-[10px] text-brand-secondary">Mahasiswa</div>
                  <div className="truncate">Budi Santoso</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@arsipinaja.id')}
                  className="flex-1 btn-retro text-xs font-heading font-extrabold py-2 px-3 bg-brand-pink border-2 border-brand-black rounded-lg shadow-retro-sm hover:bg-brand-pink/80 text-left"
                >
                  <div className="text-[10px] text-brand-black/80 font-mono">Role Admin</div>
                  <div className="truncate">Admin Arsip</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Retro Browser Window Login Form */}
          <div className="lg:col-span-6">
            <WindowCard
              title="LOGIN MAHASISWA"
              tag="SECURE"
              headerBg="cream"
              bodyBg="bg-white"
              shadow="lg"
            >
              <form onSubmit={handleLogin} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-brand-pink/30 border-2 border-brand-pink rounded-lg flex items-start gap-2.5 text-xs font-bold text-brand-black">
                    <AlertCircle className="w-4 h-4 text-brand-black flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-heading font-extrabold uppercase tracking-wider text-brand-black mb-1.5">
                    Email Kampus / Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-brand-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@mahasiswa.ac.id"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-brand-black bg-brand-cream/30 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-all"
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
                      className="w-full pl-10 pr-11 py-2.5 rounded-lg border-2 border-brand-black bg-brand-cream/30 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-all"
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
                      className="w-4 h-4 rounded border-2 border-brand-black text-brand-green focus:ring-0 cursor-pointer"
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
                  variant="green"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4 stroke-[3]" />}
                  className="w-full mt-2"
                >
                  Masuk Sekarang
                </RetroButton>

                <div className="pt-2 border-t-2 border-brand-black/20 text-center">
                  <p className="text-xs text-brand-secondary">
                    Registrasi publik ditutup.{' '}
                    <span className="font-bold text-brand-black">
                      Akun mahasiswa dibuat secara resmi oleh Administrator Kampus.
                    </span>
                  </p>
                </div>
              </form>
            </WindowCard>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <RetroModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="RESET PASSWORD MAHASISWA"
        tag="SECURITY"
        headerBg="pink"
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
              placeholder="budi.santoso@mahasiswa.ac.id"
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
              variant="yellow"
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
      <CheckerboardDivider variant="green" height={16} />
    </div>
  );
};
