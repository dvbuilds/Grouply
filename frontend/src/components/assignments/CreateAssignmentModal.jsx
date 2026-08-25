import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { FilePlus, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { createAssignmentApi, updateAssignmentApi } from '../../api/assignments.js';

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  allGroups = [],
  assignmentToEdit = null,
  onSaved,
}) {
  const isEditing = !!assignmentToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [onedriveLink, setOnedriveLink] = useState('');
  const [targetScope, setTargetScope] = useState('all');
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.title || '');
      setDescription(assignmentToEdit.description || '');
      setDueDate(
        assignmentToEdit.due_date
          ? new Date(assignmentToEdit.due_date).toISOString().slice(0, 16)
          : ''
      );
      setOnedriveLink(assignmentToEdit.onedrive_link || '');
      setTargetScope(assignmentToEdit.target_scope || 'all');
      setSelectedGroupIds([]);
    } else {
      setTitle('');
      setDescription('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setDueDate(defaultDate.toISOString().slice(0, 16));
      setOnedriveLink('');
      setTargetScope('all');
      setSelectedGroupIds([]);
    }
    setError('');
  }, [assignmentToEdit, isOpen]);

  const handleGroupToggle = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Assignment title is required');
      return;
    }
    if (!dueDate) {
      setError('Due date is required');
      return;
    }
    if (!onedriveLink.trim()) {
      setError('A OneDrive / resource link is required');
      return;
    }
    if (!isEditing && targetScope === 'groups' && selectedGroupIds.length === 0) {
      setError('Please select at least one target group');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      let payload;
      if (isEditing) {
        payload = {
          title: title.trim(),
          description: description.trim(),
          due_date: new Date(dueDate).toISOString(),
          onedrive_link: onedriveLink.trim(),
        };
      } else {
        payload = {
          title: title.trim(),
          description: description.trim(),
          due_date: new Date(dueDate).toISOString(),
          onedrive_link: onedriveLink.trim(),
          target_scope: targetScope,
          group_ids: targetScope === 'groups' ? selectedGroupIds : undefined,
        };
      }

      const result = isEditing
        ? await updateAssignmentApi(assignmentToEdit.id, payload)
        : await createAssignmentApi(payload);

      onClose();
      if (onSaved) onSaved(result);
    } catch (err) {
      setError(
        err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Failed to save assignment. Please check all fields.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Assignment' : 'Create New Assignment'}
      subtitle="Deploy tasks and resources to student groups"
      icon={FilePlus}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#D90429]/10 border border-[#D90429]/20 rounded-xl text-xs text-[#D90429]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Assignment Title"
          placeholder="e.g. JavaScript Basics, Data Structures"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#414844]">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline the learning objectives, deliverables, and expectations..."
            className="w-full rounded-xl bg-white border border-[#c1c8c2] focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10 px-3.5 py-2.5 text-sm text-[#191c1d] placeholder:text-[#717973] outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due Date & Time"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            icon={Calendar}
            required
          />

          <Input
            label="OneDrive / Repo Link"
            type="url"
            placeholder="https://onedrive.live.com/..."
            value={onedriveLink}
            onChange={(e) => setOnedriveLink(e.target.value)}
            icon={LinkIcon}
            required
          />
        </div>

        {}
        {!isEditing && (
          <div className="space-y-2 pt-2 border-t border-[#f3f4f5]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#414844]">
              Target Audience
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#f3f4f5] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTargetScope('all')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetScope === 'all'
                    ? 'bg-white text-[#012d1d] shadow-xs'
                    : 'text-[#717973] hover:text-[#191c1d]'
                }`}
              >
                All Active Groups
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('groups')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetScope === 'groups'
                    ? 'bg-white text-[#012d1d] shadow-xs'
                    : 'text-[#717973] hover:text-[#191c1d]'
                }`}
              >
                Specific Groups
              </button>
            </div>

            {targetScope === 'groups' && (
              <div className="mt-3 p-3 bg-[#f8f9fa] rounded-xl border border-[#e1e3e4] space-y-2 max-h-40 overflow-y-auto">
                <p className="text-[11px] font-semibold text-[#414844] uppercase tracking-wide">
                  Select Targeted Groups:
                </p>
                {allGroups.map((group) => (
                  <label
                    key={group.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white text-xs text-[#191c1d] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                      className="w-4 h-4 rounded text-[#012d1d] focus:ring-[#012d1d] border-[#c1c8c2]"
                    />
                    <span className="font-medium">{group.name}</span>
                    {group.member_count != null && (
                      <span className="text-[11px] text-[#717973] ml-auto">
                        {group.member_count} members
                      </span>
                    )}
                  </label>
                ))}
                {allGroups.length === 0 && (
                  <p className="text-xs text-[#717973]">No groups created yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f3f4f5]">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
