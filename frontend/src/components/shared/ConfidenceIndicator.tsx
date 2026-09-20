import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface ConfidenceIndicatorProps {
  score?: number; // 0 to 1
  level?: 'high' | 'medium' | 'low';
  sourceCount?: number;
  className?: string;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score = 0.92,
  level = 'high',
  sourceCount = 3,
  className = '',
}) => {
  const percentage = Math.round(score * 100);

  const levelConfigs = {
    high: {
      badgeVariant: 'high' as const,
      label: 'High Confidence',
      barColor: 'bg-forest',
    },
    medium: {
      badgeVariant: 'medium' as const,
      label: 'Medium Confidence',
      barColor: 'bg-ayush-warning',
    },
    low: {
      badgeVariant: 'low' as const,
      label: 'Low / Preliminary',
      barColor: 'bg-ayush-danger',
    },
  };

  const current = levelConfigs[level] || levelConfigs.high;

  return (
    <div className={`inline-flex items-center gap-2.5 p-2 rounded-xl bg-cream/30 border border-greige/70 ${className}`}>
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-forest" />
        <Badge variant={current.badgeVariant} size="sm" dot>
          {current.label} ({percentage}%)
        </Badge>
      </div>

      <div className="w-16 h-1.5 bg-greige/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${current.barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {sourceCount > 0 && (
        <span className="text-[11px] text-forest-muted">
          Grounded in {sourceCount} verified sources
        </span>
      )}
    </div>
  );
};
