import React from 'react';
import { ChevronRight, Folder, Home } from 'lucide-react';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface RetroBreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
  className?: string;
}

export const RetroBreadcrumbs: React.FC<RetroBreadcrumbsProps> = ({
  items,
  onNavigate,
  className = '',
}) => {
  return (
    <nav
      className={`flex items-center flex-wrap gap-1.5 bg-brand-cream border-2 border-brand-black px-3.5 py-2 rounded-lg shadow-retro-sm text-sm font-bold ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.id ?? 'root'}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-brand-black stroke-[3] mx-0.5 flex-shrink-0" />
            )}

            <button
              onClick={() => onNavigate(item.id)}
              disabled={isLast}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded transition-all select-none ${
                isLast
                  ? 'bg-brand-yellow border border-brand-black text-brand-black font-extrabold cursor-default shadow-xs'
                  : 'hover:bg-brand-black/10 text-brand-black/80 hover:text-brand-black cursor-pointer'
              }`}
            >
              {index === 0 ? (
                <Home className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Folder className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{item.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
