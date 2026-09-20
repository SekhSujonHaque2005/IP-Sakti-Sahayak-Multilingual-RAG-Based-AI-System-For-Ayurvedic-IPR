import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sage' | 'terracotta' | 'forest' | 'greige' | 'danger' | 'warning' | 'high' | 'medium' | 'low';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sage',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-3 py-1 font-medium tracking-wide',
  };

  const variantStyles = {
    sage: 'bg-sage/15 text-[#5C645E] border border-sage/30',
    terracotta: 'bg-terracotta/10 text-terracotta border border-terracotta/25',
    forest: 'bg-forest/10 text-forest border border-forest/20',
    greige: 'bg-greige/30 text-forest border border-greige/50',
    danger: 'bg-ayush-danger/10 text-ayush-danger border border-ayush-danger/25',
    warning: 'bg-ayush-warning/10 text-ayush-warning border border-ayush-warning/25',
    high: 'bg-forest/10 text-forest border border-forest/30 font-semibold',
    medium: 'bg-ayush-warning/10 text-ayush-warning border border-ayush-warning/30 font-semibold',
    low: 'bg-ayush-danger/10 text-ayush-danger border border-ayush-danger/30 font-semibold',
  };

  const dotColors = {
    sage: 'bg-sage-600',
    terracotta: 'bg-terracotta',
    forest: 'bg-forest',
    greige: 'bg-greige-dark',
    danger: 'bg-ayush-danger',
    warning: 'bg-ayush-warning',
    high: 'bg-forest',
    medium: 'bg-ayush-warning',
    low: 'bg-ayush-danger',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || 'bg-forest'}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
