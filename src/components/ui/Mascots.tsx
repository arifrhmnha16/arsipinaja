import React from 'react';

// Retro Happy Sun Mascot with cartoon eyes and rays (Nyonyo Reference)
export const SunMascot: React.FC<{ size?: number; className?: string }> = ({ size = 120, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sun Rays */}
      <g stroke="#171717" strokeWidth="3" strokeLinecap="round">
        <line x1="80" y1="8" x2="80" y2="28" />
        <line x1="80" y1="132" x2="80" y2="152" />
        <line x1="8" y1="80" x2="28" y2="80" />
        <line x1="132" y1="80" x2="152" y2="80" />
        <line x1="29" y1="29" x2="43" y2="43" />
        <line x1="117" y1="117" x2="131" y2="131" />
        <line x1="29" y1="131" x2="43" y2="117" />
        <line x1="117" y1="43" x2="131" y2="29" />
        <line x1="52" y1="15" x2="58" y2="33" />
        <line x1="108" y1="15" x2="102" y2="33" />
        <line x1="15" y1="52" x2="33" y2="58" />
        <line x1="145" y1="52" x2="127" y2="58" />
        <line x1="15" y1="108" x2="33" y2="102" />
        <line x1="145" y1="108" x2="127" y2="102" />
      </g>
      {/* Sun Main Body */}
      <circle cx="80" cy="80" r="50" fill="#FFE500" stroke="#171717" strokeWidth="3.5" />
      {/* Left Eye */}
      <ellipse cx="68" cy="74" rx="7" ry="10" fill="#171717" />
      <ellipse cx="66" cy="71" rx="2.5" ry="3.5" fill="#FFFFFF" />
      {/* Right Eye */}
      <ellipse cx="92" cy="74" rx="7" ry="10" fill="#171717" />
      <ellipse cx="90" cy="71" rx="2.5" ry="3.5" fill="#FFFFFF" />
      {/* Cartoon Whistling / Happy Mouth */}
      <ellipse cx="80" cy="94" rx="5" ry="7" fill="#171717" />
      {/* Cheek Blush */}
      <circle cx="56" cy="85" r="4" fill="#F381A6" />
      <circle cx="104" cy="85" r="4" fill="#F381A6" />
    </svg>
  );
};

// Retro Cloud Mascot with curious cartoon eyes (Nyonyo Reference)
export const CloudMascot: React.FC<{ size?: number; className?: string }> = ({ size = 90, className = '' }) => {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 120 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M25 55C15 55 8 47 8 38C8 30 14 24 22 23C24 12 34 5 46 5C56 5 65 11 68 20C73 17 80 18 84 22C90 20 98 22 102 28C109 30 114 36 114 43C114 51 107 55 100 55H25Z"
        fill="#FFFFFF"
        stroke="#171717"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Eyes */}
      <ellipse cx="50" cy="36" rx="4.5" ry="6.5" fill="#171717" />
      <circle cx="48.5" cy="34" r="1.5" fill="#FFFFFF" />
      <ellipse cx="65" cy="36" rx="4.5" ry="6.5" fill="#171717" />
      <circle cx="63.5" cy="34" r="1.5" fill="#FFFFFF" />
      {/* Soft Smile */}
      <path d="M54 44C56 46 59 46 61 44" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

// Starburst Burst Badge (Like "780 GLYPHS" pink badge)
export const StarburstBadge: React.FC<{
  text: string;
  subtext?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}> = ({
  text,
  subtext,
  bgColor = '#F381A6',
  textColor = '#171717',
  className = '',
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center p-3 animate-wobble-slow ${className}`}>
      <svg
        className="w-24 h-24 drop-shadow-[3px_3px_0px_#171717]"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M50 0L58 22L80 11L73 34L97 38L78 54L95 72L71 73L74 97L54 80L42 98L36 75L12 85L23 63L0 55L20 42L7 23L30 26L31 2L50 22L50 0Z"
          fill={bgColor}
          stroke="#171717"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none pointer-events-none">
        <span
          className="font-display font-extrabold text-sm tracking-tight"
          style={{ color: textColor }}
        >
          {text}
        </span>
        {subtext && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider mt-0.5"
            style={{ color: textColor }}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

// Checkerboard decorative banner
export const CheckerboardDivider: React.FC<{
  variant?: 'blue' | 'green' | 'pink' | 'yellow';
  height?: number;
  className?: string;
}> = ({ variant = 'blue', height = 16, className = '' }) => {
  const bgClass =
    variant === 'blue'
      ? 'bg-checkerboard-blue'
      : variant === 'green'
      ? 'bg-checkerboard-green'
      : variant === 'pink'
      ? 'bg-checkerboard-pink'
      : 'bg-checkerboard-yellow';

  return (
    <div
      className={`w-full border-y-2 border-brand-black ${bgClass} ${className}`}
      style={{ height: `${height}px` }}
    />
  );
};

// Retro Pill Tag
export const RetroPill: React.FC<{
  children: React.ReactNode;
  variant?: 'yellow' | 'green' | 'pink' | 'blue' | 'cream' | 'white';
  className?: string;
}> = ({ children, variant = 'yellow', className = '' }) => {
  const bg = {
    yellow: 'bg-brand-yellow text-brand-black',
    green: 'bg-brand-green text-white',
    pink: 'bg-brand-pink text-brand-black',
    blue: 'bg-brand-blue text-white',
    cream: 'bg-brand-cream text-brand-black',
    white: 'bg-white text-brand-black',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide border-2 border-brand-black shadow-retro-sm ${bg} ${className}`}
    >
      {children}
    </span>
  );
};
