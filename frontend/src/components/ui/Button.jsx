import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#012d1d] hover:bg-[#1b4332] text-white focus:ring-[#012d1d] shadow-sm hover:shadow',
    secondary:
      'bg-[#ffb702] hover:bg-[#ffba27] text-[#271900] font-semibold focus:ring-[#ffb702] shadow-sm',
    accent:
      'bg-[#4361EE] hover:bg-[#3a53d0] text-white font-semibold focus:ring-[#4361EE] shadow-sm',
    outline:
      'border border-[#c1c8c2] bg-white hover:bg-[#f3f4f5] text-[#191c1d] focus:ring-[#012d1d]',
    danger:
      'bg-[#D90429] hover:bg-[#ba1a1a] text-white focus:ring-[#D90429] shadow-sm',
    ghost:
      'text-[#414844] hover:bg-[#e1e3e4]/50 focus:ring-[#012d1d]',
    white:
      'bg-white text-[#012d1d] hover:bg-[#f8f9fa] shadow-sm font-semibold focus:ring-white',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
