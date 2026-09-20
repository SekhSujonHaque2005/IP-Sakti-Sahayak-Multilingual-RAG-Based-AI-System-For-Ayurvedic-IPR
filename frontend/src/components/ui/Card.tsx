import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'cream' | 'off-white' | 'forest' | 'bordered';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'cream',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    cream: 'bg-[#EDE4D3]/40 border border-greige/70 shadow-warm-sm',
    'off-white': 'bg-[#FAF7F2] border border-greige/80 shadow-warm-sm',
    forest: 'bg-forest text-[#FAF7F2] border border-forest-800 shadow-warm-md',
    bordered: 'bg-white/60 border border-greige/60 shadow-warm-sm backdrop-blur-sm',
  };

  const hoverStyle = hoverEffect
    ? 'transition-all duration-300 hover:shadow-warm-md hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl md:rounded-3xl p-6 md:p-8 ${variantStyles[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
