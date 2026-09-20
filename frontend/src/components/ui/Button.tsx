import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-terracotta text-[#FAF7F2] hover:bg-terracotta-600 active:scale-[0.98] shadow-warm-sm focus:ring-terracotta/40',
    secondary:
      'bg-forest text-[#FAF7F2] hover:bg-forest-800 active:scale-[0.98] shadow-warm-sm focus:ring-forest/40',
    outline:
      'border border-forest/30 text-forest bg-transparent hover:bg-forest/5 active:scale-[0.98] focus:ring-forest/30',
    ghost:
      'text-forest hover:bg-forest/5 active:scale-[0.98] focus:ring-forest/20',
    destructive:
      'bg-ayush-danger/10 text-ayush-danger border border-ayush-danger/30 hover:bg-ayush-danger hover:text-white active:scale-[0.98] focus:ring-ayush-danger/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      <span>{children}</span>
    </button>
  );
};
