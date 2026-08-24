import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  icon: Icon,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#191c1d]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-[#e1e3e4] overflow-hidden z-10 transition-all transform scale-100 opacity-100 my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3f4f5] bg-[#f8f9fa]">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-9 h-9 rounded-xl bg-[#012d1d]/10 text-[#012d1d] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="font-bold text-lg text-[#191c1d] tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-[#717973] mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#717973] hover:bg-[#e1e3e4]/60 hover:text-[#191c1d] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
