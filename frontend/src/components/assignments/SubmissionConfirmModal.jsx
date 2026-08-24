import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { confirmSubmissionApi } from '../../api/submissions.js';

export default function SubmissionConfirmModal({
  isOpen,
  onClose,
  assignment,
  groupId,
  groupName,
  onSubmissionSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!assignment?.id || !groupId) {
      setError('Missing assignment or group ID');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const response = await confirmSubmissionApi(assignment.id, groupId);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSubmissionSuccess) onSubmissionSuccess(response);
      }, 1400);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to confirm submission. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Assignment"
      maxWidth="max-w-md"
      icon={Send}
    >
      {isSuccess ? (
        <div className="py-6 flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#191c1d]">Submission Confirmed!</h3>
          <p className="text-xs text-[#414844]">
            Your group's work for <strong>{assignment?.title}</strong> has been officially recorded.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#D90429]/10 border border-[#D90429]/20 rounded-xl text-xs text-[#D90429]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-[#414844] leading-relaxed">
            You are about to submit your work for{' '}
            <strong className="text-[#191c1d]">{assignment?.title}</strong>.
          </p>

          <div className="bg-[#f8f9fa] p-4 rounded-xl border border-[#e1e3e4] space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#717973]">Submitting Group</span>
              <span className="font-bold text-[#191c1d]">{groupName || `Group #${groupId}`}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#717973]">Status</span>
              <span className="font-bold text-[#2D6A4F] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
                Ready to Confirm
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-[#FB8500]/10 border border-[#FB8500]/20 rounded-xl text-xs text-[#b56000]">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Once confirmed, this submission will be marked as complete for all group members and recorded in the professor's dashboard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f3f4f5]">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isSubmitting}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
