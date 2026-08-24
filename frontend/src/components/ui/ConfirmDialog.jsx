import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'primary', 'success'
  isLoading = false,
  details,
}) {
  const icons = {
    danger: AlertTriangle,
    primary: Info,
    success: CheckCircle2,
  };

  const IconComponent = icons[variant] || AlertTriangle;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            variant === 'danger'
              ? 'bg-[#D90429]/10 text-[#D90429]'
              : variant === 'success'
              ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
              : 'bg-[#012d1d]/10 text-[#012d1d]'
          }`}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-[#191c1d] mb-2">{title}</h3>
        <p className="text-sm text-[#414844] leading-relaxed mb-4">{message}</p>

        {details && (
          <div className="w-full bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl p-3.5 mb-5 text-left text-xs text-[#414844] space-y-1.5">
            {details}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 w-full mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
