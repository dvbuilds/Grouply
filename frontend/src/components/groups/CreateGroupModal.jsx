import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { Users, AlertCircle } from 'lucide-react';
import { createGroupApi } from '../../api/groups.js';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const newGroup = await createGroupApi({ name: name.trim() });
      setName('');
      onClose();
      if (onGroupCreated) onGroupCreated(newGroup);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Failed to create group. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Group"
      subtitle="You will automatically become the group leader"
      icon={Users}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#D90429]/10 border border-[#D90429]/20 rounded-xl text-xs text-[#D90429]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Group Name"
          placeholder="e.g. Alpha Cohort, Web Wizards, AI Innovators"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl p-3 text-xs text-[#414844] space-y-1">
          <p className="font-semibold text-[#191c1d]">Leader Privileges:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[#717973]">
            <li>Add members by email or Student ID</li>
            <li>Manage group assignments and view progress</li>
            <li>Remove members or disband the group if needed</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
