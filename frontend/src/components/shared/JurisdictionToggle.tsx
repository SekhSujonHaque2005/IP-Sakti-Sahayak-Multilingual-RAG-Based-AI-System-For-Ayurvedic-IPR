import React from 'react';
import { Globe, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface JurisdictionToggleProps {
  className?: string;
  size?: 'sm' | 'md';
  fullLabels?: boolean;
}

export const JurisdictionToggle: React.FC<JurisdictionToggleProps> = ({
  className = '',
  size = 'md',
  fullLabels = false,
}) => {
  const { jurisdiction, setJurisdiction } = useApp();

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-full bg-white/55 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(40,61,52,0.04)] shrink-0 ${className}`}
      role="group"
      aria-label="Statutory Jurisdiction Mode"
    >
      <button
        type="button"
        onClick={() => setJurisdiction('IN')}
        title="India (AYUSH / NBA statutory framework)"
        className={`flex items-center gap-1 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
          isSmall ? 'text-xs px-2.5 py-1' : 'text-xs px-4 py-1.5'
        } ${
          jurisdiction === 'IN'
            ? 'bg-terracotta text-white shadow-warm-xs font-semibold'
            : 'text-forest/75 hover:text-forest hover:bg-white/40'
        }`}
      >
        <MapPin className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} shrink-0`} />
        <span className="whitespace-nowrap">{fullLabels ? 'India (AYUSH / NBA)' : 'India'}</span>
      </button>

      <button
        type="button"
        onClick={() => setJurisdiction('INTL')}
        title="International (WIPO / Nagoya Protocol treaties)"
        className={`flex items-center gap-1 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
          isSmall ? 'text-xs px-2.5 py-1' : 'text-xs px-4 py-1.5'
        } ${
          jurisdiction === 'INTL'
            ? 'bg-terracotta text-white shadow-warm-xs font-semibold'
            : 'text-forest/75 hover:text-forest hover:bg-white/40'
        }`}
      >
        <Globe className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} shrink-0`} />
        <span className="whitespace-nowrap">
          {fullLabels ? 'International (WIPO / Nagoya)' : (
            <>
              <span className="hidden xl:inline">International</span>
              <span className="xl:hidden">Intl</span>
            </>
          )}
        </span>
      </button>
    </div>
  );
};
