import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { UserPlus, Mail, IdCard, AlertCircle } from 'lucide-react';
import { addGroupMemberApi } from '../../api/groups.js';

export default function AddMemberModal({ isOpen, onClose, groupId, groupName, onMemberAdded }) {
  const [inputType, setInputType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Please enter a student ${inputType === 'email' ? 'email' : 'ID'}`);
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const payload = inputType === 'email' ? { email: identifier.trim() } : { student_id: identifier.trim() };
      await addGroupMemberApi(groupId, payload);
      setIdentifier('');
      onClose();
      if (onMemberAdded) onMemberAdded();
    } catch (err) {
      setError(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Failed to add member. Please check the identifier.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Group Member"
      subtitle={`Adding to ${groupName || 'Group'}`}
      icon={UserPlus}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#D90429]/10 border border-[#D90429]/20 rounded-xl text-xs text-[#D90429]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#414844]">
            Find Student By
          </label>
          <div className="grid grid-cols-2 gap-2 bg-[#f3f4f5] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setInputType('email');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                inputType === 'email'
                  ? 'bg-white text-[#012d1d] shadow-xs'
                  : 'text-[#717973] hover:text-[#191c1d]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Student Email
            </button>
            <button
              type="button"
              onClick={() => {
                setInputType('student_id');
                setError('');
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                inputType === 'student_id'
                  ? 'bg-white text-[#012d1d] shadow-xs'
                  : 'text-[#717973] hover:text-[#191c1d]'
              }`}
            >
              <IdCard className="w-3.5 h-3.5" />
              Student ID
            </button>
          </div>
        </div>

        {inputType === 'email' ? (
          <Input
            label="Student Email"
            type="email"
            placeholder="e.g. aarav@joineazy.dev"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={Mail}
            required
            autoFocus
            helperText="Enter the registered email of the student"
          />
        ) : (
          <Input
            label="Student ID"
            placeholder="e.g. STU-1002, STU-1004"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={IdCard}
            required
            autoFocus
            helperText="Enter the official student identification number"
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
