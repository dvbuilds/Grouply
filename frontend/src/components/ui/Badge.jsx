import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variantStyles = {
    success: 'bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20',
    warning: 'bg-[#FB8500]/10 text-[#b56000] border border-[#FB8500]/20',
    error: 'bg-[#D90429]/10 text-[#D90429] border border-[#D90429]/20',
    info: 'bg-[#00B4D8]/10 text-[#0089a5] border border-[#00B4D8]/20',
    accent: 'bg-[#4361EE]/10 text-[#4361EE] border border-[#4361EE]/20',
    tertiary: 'bg-[#ebdcff] text-[#2e1b50] border border-[#d3bcfc]',
    neutral: 'bg-[#f3f4f5] text-[#414844] border border-[#e1e3e4]',
    primary: 'bg-[#012d1d] text-white',
  };

  const dotColors = {
    success: 'bg-[#2D6A4F]',
    warning: 'bg-[#FB8500]',
    error: 'bg-[#D90429]',
    info: 'bg-[#00B4D8]',
    accent: 'bg-[#4361EE]',
    tertiary: 'bg-[#2e1b50]',
    neutral: 'bg-[#717973]',
    primary: 'bg-white',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      {children}
    </span>
  );
}
