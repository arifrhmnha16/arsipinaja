import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ArchivePage } from '../pages/archive/ArchivePage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { CalendarPage } from '../pages/calendar/CalendarPage';
import { FavoritesPage } from '../pages/favorites/FavoritesPage';
import { SharedDocumentsPage } from '../pages/shared/SharedDocumentsPage';
import { TrashPage } from '../pages/trash/TrashPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { AdminPage } from '../pages/admin/AdminPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center font-display text-brand-black gap-3 select-none">
        <div className="w-12 h-12 rounded-2xl border-3 border-brand-black bg-brand-blue text-white flex items-center justify-center font-black text-2xl shadow-retro">
          A
        </div>
        <div className="font-heading font-extrabold text-sm tracking-tight text-brand-navy">
          Memuat Ruang Berdua...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="shared" element={<SharedDocumentsPage />} />
        <Route path="trash" element={<TrashPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
