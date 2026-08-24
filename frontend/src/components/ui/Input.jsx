import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#414844]"
        >
          {label} {required && <span className="text-[#D90429]">*</span>}
        </label>
      )}
      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#717973]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          className={`w-full rounded-xl bg-white border ${
            error ? 'border-[#D90429] focus:ring-[#D90429]/20' : 'border-[#c1c8c2] focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10'
          } ${Icon ? 'pl-10' : 'px-3.5'} py-2.5 text-sm text-[#191c1d] placeholder:text-[#717973] outline-none transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#D90429] font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#717973]">{helperText}</p>}
    </div>
  );
}
