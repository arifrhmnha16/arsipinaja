import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

/**
 * Modern Clean Retro Archive Box Logo for ArsipinAja.
 * Graphic symbol representing smart document archiving, dossiers, and vault storage.
 * Completely letter-free, crisp vector lines, neo-brutalist styling.
 */
export const AppLogo: React.FC<AppLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="ArsipinAja Logo"
      role="img"
    >
      {/* Back Folder / Dossier Tab */}
      <path
        d="M6 11C6 9.34315 7.34315 8 9 8H16L19 11H27C28.6569 11 30 12.3431 30 14V17H6V11Z"
        fill="#38BDF8"
        stroke="#171717"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* File Document Paper Peeking with folded ear */}
      <path
        d="M10 8V5C10 4.44772 10.4477 4 11 4H20L23 7V11"
        fill="#FFFFFF"
        stroke="#171717"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <line x1="13" y1="7" x2="18" y2="7" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Front Archival Storage Box / Drawer */}
      <rect
        x="5"
        y="13"
        width="26"
        height="18"
        rx="3.5"
        fill="#2563EB"
        stroke="#171717"
        strokeWidth="2.2"
      />

      {/* Drawer Top Division */}
      <line x1="5" y1="18" x2="31" y2="18" stroke="#171717" strokeWidth="1.8" />

      {/* Handle / Index Tag Slot */}
      <rect
        x="13"
        y="22"
        width="10"
        height="4.5"
        rx="1.5"
        fill="#FFFFFF"
        stroke="#171717"
        strokeWidth="1.6"
      />
      <line
        x1="15.5"
        y1="24.25"
        x2="20.5"
        y2="24.25"
        stroke="#171717"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Twin accent rivets */}
      <circle cx="8.5" cy="24.25" r="1" fill="#38BDF8" stroke="#171717" strokeWidth="0.8" />
      <circle cx="27.5" cy="24.25" r="1" fill="#38BDF8" stroke="#171717" strokeWidth="0.8" />

      {/* Retro Sparkle Star */}
      <path
        d="M30 2L30.9 4.7L33.6 5.6L30.9 6.5L30 9.2L29.1 6.5L26.4 5.6L29.1 4.7L30 2Z"
        fill="#FACC15"
        stroke="#171717"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
};
