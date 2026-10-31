import React from 'react';

interface WindowCardProps {
  title?: string;
  tag?: string;
  headerBg?: 'yellow' | 'green' | 'pink' | 'blue' | 'cream' | 'white';
  bodyBg?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'pink' | 'yellow' | 'green';
  className?: string;
  bodyClassName?: string;
}

export const WindowCard: React.FC<WindowCardProps> = ({
  title,
  tag,
  headerBg = 'blue',
  bodyBg = 'bg-white',
  children,
  headerActions,
  shadow = 'md',
  className = '',
  bodyClassName = 'p-4 sm:p-5',
}) => {
  const headerColors = {
    yellow: 'bg-brand-blue text-white',
    green: 'bg-brand-cyan text-white',
    pink: 'bg-brand-navy text-white',
    blue: 'bg-brand-blue text-white',
    cream: 'bg-brand-ice text-brand-navy',
    white: 'bg-white text-brand-black',
  }[headerBg] || 'bg-brand-blue text-white';

  const shadowClasses = {
    none: '',
    sm: 'shadow-retro-sm',
    md: 'shadow-retro',
    lg: 'shadow-retro-lg',
    pink: 'shadow-retro-navy',
    yellow: 'shadow-retro-sky',
    green: 'shadow-retro-navy',
  }[shadow];

  return (
    <div
      className={`rounded-xl border-3 border-brand-black overflow-hidden ${shadowClasses} ${bodyBg} ${className}`}
    >
      {/* Retro Window Titlebar */}
      <div
        className={`flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 border-b-2 border-brand-black select-none gap-2 ${headerColors}`}
      >
        {/* Left: Window Control Dots (Blue Tones) & Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-brand-black bg-[#38BDF8] inline-block shadow-sm" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-brand-black bg-[#2563EB] inline-block shadow-sm" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-brand-black bg-[#1E3A8A] inline-block shadow-sm" />
          </div>

          {title && (
            <span className="font-heading font-extrabold text-[11px] sm:text-xs tracking-wider uppercase ml-1 sm:ml-1.5 truncate min-w-0">
              {title}
            </span>
          )}
        </div>

        {/* Center / Right: Pill tag or actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {tag && (
            <span className="bg-brand-navy text-white font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20 truncate max-w-[120px]">
              {tag}
            </span>
          )}
          {headerActions}
        </div>
      </div>

      {/* Window Body with strict text containment */}
      <div className={`min-w-0 overflow-hidden break-words ${bodyClassName}`}>{children}</div>
    </div>
  );
};
