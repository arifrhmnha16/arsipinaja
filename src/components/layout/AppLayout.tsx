import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CheckerboardDivider } from '../ui/Mascots';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard Akademik',
  '/archive': 'Arsip Dokumen Kuliah',
  '/tasks': 'Manajemen Tugas Mahasiswa',
  '/calendar': 'Kalender Akademik & Deadline',
  '/favorites': 'Dokumen & Folder Favorit',
  '/shared': 'Dokumen yang Dibagikan',
  '/trash': 'Tempat Sampah (Trash)',
  '/settings': 'Pengaturan Akun & Telegram',
  '/admin': 'Panel Administrator ArsipinAja',
};

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const currentPath = location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] || 'ArsipinAja';

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Sidebar (Desktop fixed & Mobile drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenMobile={() => setIsMobileOpen(true)}
          pageTitle={pageTitle}
        />

        {/* Retro Blue Checkerboard accent divider from Nyonyo reference */}
        <CheckerboardDivider variant="blue" height={12} />

        {/* Page Main Content with subtle grid pattern background */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-graph-pattern">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Bottom footer credit & retro style */}
        <footer className="border-t-3 border-brand-black bg-brand-cream px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-secondary font-mono">
          <div>
            <span className="font-bold text-brand-black">ArsipinAja</span> © 2026 — Biar Kuliah Nggak Berantakan.
          </div>
          <div className="mt-1 sm:mt-0 flex items-center gap-3">
            <span>Asia/Jakarta (WIB)</span>
            <span>•</span>
            <span className="text-brand-green font-bold">Cloudflare R2 & Telegram Bot Ready</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
