import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { WindowCard } from './WindowCard';

interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tag?: string;
  headerBg?: 'yellow' | 'green' | 'pink' | 'blue' | 'cream' | 'white';
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const RetroModal: React.FC<RetroModalProps> = ({
  isOpen,
  onClose,
  title,
  tag = 'WINDOW',
  headerBg = 'blue',
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };
  const selectedWidthClass = widthClasses[maxWidth] || 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className={`relative w-full ${selectedWidthClass} z-10 animate-scale-in`}>
        <WindowCard
          title={title}
          tag={tag}
          headerBg={headerBg}
          shadow="lg"
          headerActions={
            <button
              onClick={onClose}
              className="p-1 rounded bg-brand-black/10 hover:bg-brand-black/20 text-brand-black transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          }
          bodyClassName="p-6 max-h-[85vh] overflow-y-auto"
        >
          {children}
        </WindowCard>
      </div>
    </div>
  );
};
