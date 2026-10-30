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
  Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

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
  const { user, role, logout, switchUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('Berhasil keluar dari akun.', 'info');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Archive', path: '/archive', icon: FolderArchive },
    { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Favorites', path: '/favorites', icon: Star },
    { label: 'Shared Documents', path: '/shared', icon: Share2 },
    { label: 'Trash', path: '/trash', icon: Trash2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (role === 'admin') {
    navItems.push({ label: 'Admin Dashboard', path: '/admin', icon: ShieldAlert });
  }

  const handleQuickSwitch = () => {
    if (user?.id === 'user_mhs_1') {
      switchUser('user_admin_1');
      showToast('Beralih ke akun Admin ArsipinAja', 'success');
      navigate('/admin');
    } else {
      switchUser('user_mhs_1');
      showToast('Beralih ke akun Mahasiswa (Budi Santoso)', 'info');
      navigate('/dashboard');
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-brand-cream border-r-3 border-brand-black text-brand-black select-none">
      {/* Brand Header */}
      <div className="p-4 border-b-3 border-brand-black bg-brand-yellow flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-black text-brand-yellow border-2 border-brand-black flex items-center justify-center font-display font-extrabold text-xl shadow-retro-sm">
              A
            </div>
            <div>
              <div className="font-display font-black text-xl tracking-tight leading-none text-brand-black">
                ArsipinAja
              </div>
              <div className="text-[10px] font-bold text-brand-secondary tracking-tight mt-0.5">
                Biar Kuliah Nggak Berantakan.
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-lg bg-brand-black text-brand-yellow border-2 border-brand-black flex items-center justify-center font-display font-extrabold text-xl shadow-retro-sm">
            A
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-cream text-brand-black shadow-retro-sm cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 stroke-[3]" /> : <ChevronLeft className="w-4 h-4 stroke-[3]" />}
        </button>
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
                      ? 'bg-brand-pink text-brand-black border-brand-black shadow-retro-sm'
                      : 'bg-brand-yellow text-brand-black border-brand-black shadow-retro-sm'
                    : 'border-transparent text-brand-black/80 hover:bg-white hover:border-brand-black/40 hover:text-brand-black'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 stroke-[2.5] flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate flex-1">
                  {item.label}
                  {isAdminItem && (
                    <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-brand-black text-brand-pink">
                      PRO
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Switcher Demo Helper */}
      {!isCollapsed && (
        <div className="px-3 py-2">
          <button
            onClick={handleQuickSwitch}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-brand-black bg-brand-pink/20 hover:bg-brand-pink/40 text-brand-black text-xs font-bold font-mono transition-colors shadow-retro-sm"
            title="Klik untuk beralih instan antara Mahasiswa & Admin"
          >
            <Zap className="w-3.5 h-3.5 text-brand-black fill-brand-yellow" />
            <span>Switch Role ({role === 'admin' ? 'Admin' : 'Mhs'})</span>
          </button>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="p-3 border-t-3 border-brand-black bg-white">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full border-2 border-brand-black bg-brand-green text-white flex items-center justify-center font-heading font-bold text-sm shadow-retro-sm flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-heading font-extrabold text-xs truncate text-brand-black flex items-center gap-1">
                  <span>{user?.name || 'Mahasiswa'}</span>
                  {role === 'admin' && (
                    <span className="text-[9px] px-1 rounded bg-brand-pink border border-brand-black font-mono">
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
              className="p-1.5 rounded-lg border-2 border-brand-black hover:bg-brand-pink text-brand-black transition-colors flex-shrink-0"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-lg border-2 border-brand-black hover:bg-brand-pink text-brand-black transition-colors"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
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
        {sidebarContent}
      </div>
    </>
  );
};
