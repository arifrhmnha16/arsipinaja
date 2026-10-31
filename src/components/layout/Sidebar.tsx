import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderArchive,
  CheckSquare,
  Calendar,
  Star,
  Share2,
  Trash2,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { AppLogo } from '../ui/AppLogo';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('Berhasil keluar dari akun.', 'info');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Arsip Materi', path: '/archive', icon: FolderArchive },
    { label: 'Tugas & Deadline', path: '/tasks', icon: CheckSquare },
    { label: 'Jadwal Kalender', path: '/calendar', icon: Calendar },
    { label: 'Dokumen Favorit', path: '/favorites', icon: Star },
    { label: 'Materi Bersama', path: '/shared', icon: Share2 },
    { label: 'Tempat Sampah', path: '/trash', icon: Trash2 },
    { label: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  if (role === 'admin') {
    navItems.push({ label: 'Kelola Akun', path: '/admin', icon: ShieldAlert });
  }



  const renderSidebarContent = (isMobile = false) => {
    const effectiveCollapsed = isMobile ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full bg-brand-ice border-r-3 border-brand-black text-brand-black select-none">
        {/* Brand Header */}
        <div className="p-4 border-b-3 border-brand-black bg-brand-blue text-white flex items-center justify-between">
          {!effectiveCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white border-2 border-brand-black flex items-center justify-center shadow-retro-sm p-0.5">
                <AppLogo size={28} />
              </div>
              <div>
                <div className="font-display font-black text-xl tracking-tight leading-none text-white">
                  ArsipinAja
                </div>
                <div className="text-[10px] font-bold text-blue-100 tracking-tight mt-0.5">
                  Ruang Berdua
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-lg bg-white border-2 border-brand-black flex items-center justify-center shadow-retro-sm p-0.5" title="ArsipinAja">
              <AppLogo size={28} />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg border-2 border-brand-black bg-white hover:bg-blue-50 text-brand-black shadow-retro-sm cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title={effectiveCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            >
              {effectiveCollapsed ? <ChevronRight className="w-4 h-4 stroke-[3]" /> : <ChevronLeft className="w-4 h-4 stroke-[3]" />}
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg border-2 border-brand-black bg-white hover:bg-blue-50 text-brand-black shadow-retro-sm cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isAdminItem = item.path === '/admin';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-heading font-extrabold text-sm transition-all border-2 ${
                    isActive
                      ? isAdminItem
                        ? 'bg-brand-sky text-brand-black border-brand-black shadow-retro-sm'
                        : 'bg-brand-blue text-white border-brand-black shadow-retro-sm'
                      : 'border-transparent text-brand-black/80 hover:bg-white hover:border-brand-black/40 hover:text-brand-blue'
                  } ${effectiveCollapsed ? 'justify-center px-2' : ''}`
                }
                title={effectiveCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 stroke-[2.5] flex-shrink-0" />
                {!effectiveCollapsed && (
                  <span className="truncate flex-1">
                    {item.label}
                    {isAdminItem && (
                      <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-brand-black text-brand-sky">
                        HUB
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t-3 border-brand-black bg-white">
          {!effectiveCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full border-2 border-brand-black bg-brand-blue text-white flex items-center justify-center font-heading font-bold text-sm shadow-retro-sm flex-shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <div className="font-heading font-extrabold text-xs truncate text-brand-black flex items-center gap-1">
                    <span>{user?.name || 'Partner'}</span>
                    {role === 'admin' && (
                      <span className="text-[9px] px-1 rounded bg-brand-navy text-white border border-brand-black font-mono">
                        ADM
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-brand-secondary font-mono truncate">
                    {user?.email || 'user@arsipinaja.id'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg border-2 border-brand-black hover:bg-brand-navy hover:text-white text-brand-black transition-colors flex-shrink-0 cursor-pointer"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg border-2 border-brand-black hover:bg-brand-navy hover:text-white text-brand-black transition-colors cursor-pointer"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-brand-black/50 z-40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 transform transition-transform duration-200 md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent(true)}
      </div>
    </>
  );
};
