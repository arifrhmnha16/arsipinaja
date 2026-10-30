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
  headerBg = 'cream',
  bodyBg = 'bg-white',
  children,
  headerActions,
  shadow = 'md',
  className = '',
  bodyClassName = 'p-5',
}) => {
  const headerColors = {
    yellow: 'bg-brand-yellow text-brand-black',
    green: 'bg-brand-green text-white',
    pink: 'bg-brand-pink text-brand-black',
    blue: 'bg-brand-blue text-white',
    cream: 'bg-brand-cream text-brand-black',
    white: 'bg-white text-brand-black',
  }[headerBg];

  const shadowClasses = {
    none: '',
    sm: 'shadow-retro-sm',
    md: 'shadow-retro',
    lg: 'shadow-retro-lg',
    pink: 'shadow-retro-pink',
    yellow: 'shadow-retro-yellow',
    green: 'shadow-retro-green',
  }[shadow];

  return (
    <div
      className={`rounded-xl border-3 border-brand-black overflow-hidden ${shadowClasses} ${bodyBg} ${className}`}
    >
      {/* Retro Window Titlebar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b-2 border-brand-black select-none ${headerColors}`}
      >
        {/* Left: Window Control Dots */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-brand-black bg-[#00A968] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full border border-brand-black bg-[#FFE500] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full border border-brand-black bg-[#F381A6] inline-block shadow-sm" />
          </div>

          {title && (
            <span className="font-heading font-extrabold text-xs tracking-wider uppercase ml-2 truncate">
              {title}
            </span>
          )}
        </div>

        {/* Center / Right: Pill tag or actions */}
        <div className="flex items-center gap-2">
          {tag && (
            <span className="bg-brand-black text-brand-yellow font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
              {tag}
            </span>
          )}
          {headerActions}
        </div>
      </div>

      {/* Window Body */}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
