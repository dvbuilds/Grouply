import React, { useState } from 'react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import { UserMinus, Crown, Mail, IdCard, User } from 'lucide-react';
import { getInitials } from '../../utils/formatters.js';

export default function GroupMembersTable({
  members = [],
  isLeader = false,
  currentUserId,
  leaderId,
  onRemoveMember,
}) {
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleConfirmRemove = async () => {
    if (!memberToRemove || !onRemoveMember) return;
    setIsRemoving(true);
    try {
      await onRemoveMember(memberToRemove.id);
      setMemberToRemove(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!members.length) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#e1e3e4] text-[#717973]">
        <User className="w-8 h-8 mx-auto mb-2 text-[#c1c8c2]" />
        <p className="text-sm">No members found in this group.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#e1e3e4] overflow-hidden soft-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-[#e1e3e4] text-[11px] font-semibold text-[#717973] uppercase tracking-wider">
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Student ID</th>
                <th className="py-3.5 px-6">Email</th>
                {isLeader && <th className="py-3.5 px-6 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f5] text-sm">
              {members.map((member) => {
                const isThisMemberLeader = member.id === leaderId;
                const isCurrentUser = member.id === currentUserId;

                return (
                  <tr
                    key={member.id || member.email}
                    className="hover:bg-[#f8f9fa]/80 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#012d1d]/10 text-[#012d1d] font-bold text-xs flex items-center justify-center">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#191c1d] flex items-center gap-1.5">
                            {member.name}
                            {isCurrentUser && (
                              <span className="text-[10px] text-[#2D6A4F] bg-[#2D6A4F]/10 font-bold px-1.5 py-0.2 rounded">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      {isThisMemberLeader ? (
                        <Badge variant="warning" dot>
                          <Crown className="w-3 h-3 text-[#FB8500] inline mr-1" />
                          Group Leader
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Member</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-[#414844] font-mono">
                      {member.student_id || '—'}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-[#717973]">
                      {member.email}
                    </td>
                    {isLeader && (
                      <td className="py-3.5 px-6 text-right">
                        {!isThisMemberLeader && (
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="p-1.5 text-[#717973] hover:text-[#D90429] hover:bg-[#D90429]/10 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Member?"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this group?`}
        confirmText="Remove"
        variant="danger"
        isLoading={isRemoving}
      />
    </>
  );
}
