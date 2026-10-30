import React from 'react';
import { Loader2 } from 'lucide-react';

export interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'green' | 'pink' | 'blue' | 'cream' | 'white' | 'black' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles = {
    yellow: 'bg-brand-yellow text-brand-black hover:bg-[#ebd300]',
    green: 'bg-brand-green text-white hover:bg-[#009259]',
    pink: 'bg-brand-pink text-brand-black hover:bg-[#ea6d95]',
    blue: 'bg-brand-blue text-white hover:bg-[#2c77b0]',
    cream: 'bg-brand-cream text-brand-black hover:bg-[#fae2c0]',
    white: 'bg-white text-brand-black hover:bg-neutral-100',
    black: 'bg-brand-black text-brand-yellow hover:bg-neutral-800',
    outline: 'bg-transparent text-brand-black hover:bg-black/5',
  }[variant];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-bold gap-1.5',
    md: 'px-4 py-2.5 text-sm font-extrabold gap-2',
    lg: 'px-6 py-3.5 text-base font-extrabold gap-2.5',
  }[size];

  return (
    <button
      disabled={disabled || isLoading}
      className={`btn-retro inline-flex items-center justify-center rounded-lg border-2 border-brand-black shadow-retro font-heading uppercase tracking-wide select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
