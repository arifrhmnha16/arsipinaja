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
    <header className="sticky top-0 z-20 bg-white border-b-3 border-brand-black px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 select-none">
      {/* Left: Mobile Menu & Current Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg border-2 border-brand-black bg-brand-blue text-white shadow-retro-sm cursor-pointer flex-shrink-0"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        {pageTitle && (
          <h1 className="font-display font-black text-base sm:text-xl text-brand-black truncate min-w-0">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right: Badges and Live Time */}
      <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
        {/* Live WIB Clock Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-brand-black bg-brand-ice text-xs font-mono font-bold shadow-retro-sm">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{wibTime || '21:09:26 WIB'}</span>
        </div>

        {/* Telegram Status Pill */}
        <Link
          to="/settings?tab=telegram"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-brand-black text-xs font-heading font-extrabold shadow-retro-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
            isTelegramConnected
              ? 'bg-brand-blue text-white hover:bg-blue-700'
              : 'bg-brand-ice text-brand-black hover:bg-blue-100'
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
