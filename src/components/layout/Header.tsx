import React, { useState, useEffect } from 'react';
import { Menu, Send, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onOpenMobile: () => void;
  pageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile, pageTitle }) => {
  const { user } = useAuth();
  const [wibTime, setWibTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WIB (Asia/Jakarta)
      const formatted = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now);
      setWibTime(`${formatted} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isTelegramConnected = Boolean(user?.telegramChatId);

  return (
    <header className="sticky top-0 z-20 bg-white border-b-3 border-brand-black px-4 sm:px-6 py-3 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Menu & Current Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg border-2 border-brand-black bg-brand-yellow text-brand-black shadow-retro-sm cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        {pageTitle && (
          <h1 className="font-display font-black text-lg sm:text-xl text-brand-black truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right: Badges and Live Time */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live WIB Clock Pill (Nyonyo Reference pill like "13:29:30") */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-brand-black bg-brand-cream text-xs font-mono font-bold shadow-retro-sm">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{wibTime || '21:09:26 WIB'}</span>
        </div>

        {/* Semester Badge */}
        {user?.semester && user.semester > 0 ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-brand-black bg-brand-yellow text-xs font-heading font-extrabold shadow-retro-sm">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Semester {user.semester}</span>
          </div>
        ) : null}

        {/* Telegram Status Pill */}
        <Link
          to="/settings?tab=telegram"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-brand-black text-xs font-heading font-extrabold shadow-retro-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
            isTelegramConnected
              ? 'bg-brand-green text-white hover:bg-[#009259]'
              : 'bg-brand-pink text-brand-black hover:bg-[#ea6d95]'
          }`}
          title={isTelegramConnected ? 'Telegram Terhubung' : 'Hubungkan Telegram untuk Notifikasi Bot'}
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline">
            {isTelegramConnected ? 'TG Terhubung' : 'Hubungkan TG'}
          </span>
        </Link>
      </div>
    </header>
  );
};
