import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import GroupMembersTable from '../../components/groups/GroupMembersTable.jsx';
import AddMemberModal from '../../components/groups/AddMemberModal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import {
  getMyGroupsApi,
  getGroupMembersApi,
  removeGroupMemberApi,
  leaveGroupApi,
  deleteGroupApi,
} from '../../api/groups.js';
import { getGroupProgressApi } from '../../api/submissions.js';
import {
  Users,
  UserPlus,
  Crown,
  Trash2,
  LogOut,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function StudentGroupDetail() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [progress, setProgress] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true);
      const [allMyGroups, memberList, progressData] = await Promise.all([
        getMyGroupsApi(),
        getGroupMembersApi(groupId),
        getGroupProgressApi(groupId).catch(() => null),
      ]);

      const currentGroup = (allMyGroups || []).find(
        (g) => String(g.id) === String(groupId)
      );

      setGroup(currentGroup || { id: groupId, name: `Group #${groupId}` });
      setMembers(memberList || []);
      setProgress(progressData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const isLeader = group?.leader_id === user?.id;

  const handleRemoveMember = async (memberId) => {
    await removeGroupMemberApi(groupId, memberId);
    fetchGroupDetails();
  };

  const handleLeaveGroup = async () => {
    setIsActionLoading(true);
    try {
      await leaveGroupApi(groupId);
      setIsLeaveOpen(false);
      navigate('/student/groups');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to leave group');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsActionLoading(true);
    try {
      await deleteGroupApi(groupId);
      setIsDeleteOpen(false);
      navigate('/student/groups');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={group?.name || 'Group Details'}
      subtitle="Group Roster & Assignment Progress"
    >
      <div className="space-y-6 pb-12">
        {/* Back Link */}
        <button
          onClick={() => navigate('/student/groups')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#414844] hover:text-[#012d1d] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to My Groups</span>
        </button>

        {/* Group Header Hero */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e1e3e4] soft-shadow flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#012d1d] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {group?.name?.charAt(0) || 'G'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl md:text-2xl font-bold text-[#191c1d]">
                  {group?.name || 'Study Group'}
                </h2>
                {isLeader ? (
                  <Badge variant="warning" dot>
                    <Crown className="w-3.5 h-3.5 text-[#FB8500] inline mr-1" />
                    You are Leader
                  </Badge>
                ) : (
                  <Badge variant="neutral">Member</Badge>
                )}
              </div>
              <p className="text-xs text-[#717973] flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {new Date(group?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isLeader ? (
              <>
                <Button
                  variant="primary"
                  onClick={() => setIsAddOpen(true)}
                  icon={UserPlus}
                >
                  Add Member
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-[#D90429] hover:bg-[#D90429]/10 hover:border-[#D90429]"
                  icon={Trash2}
                >
                  Disband Group
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsLeaveOpen(true)}
                className="text-[#D90429] hover:bg-[#D90429]/10"
                icon={LogOut}
              >
                Leave Group
              </Button>
            )}
          </div>
        </div>

        {/* Group Assignment Progress Card */}
        {progress && (
          <div className="bg-white rounded-2xl p-6 border border-[#e1e3e4] soft-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#191c1d]">
                  Group Assignment Progress
                </h3>
                <p className="text-xs text-[#717973]">
                  {progress.confirmed || 0} of {progress.total || 0} completed
                </p>
              </div>
              <span className="text-lg font-bold text-[#012d1d]">
                {progress.percent || 0}%
              </span>
            </div>
            <ProgressBar value={progress.percent || 0} color="auto" size="md" />
          </div>
        )}

        {/* Group Members Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-[#191c1d]">Group Roster</h3>
              <Badge variant="neutral">{members.length} students</Badge>
            </div>
            {isLeader && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                icon={UserPlus}
              >
                Add via Email / ID
              </Button>
            )}
          </div>

          <GroupMembersTable
            members={members}
            isLeader={isLeader}
            currentUserId={user?.id}
            leaderId={group?.leader_id}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        groupId={groupId}
        groupName={group?.name}
        onMemberAdded={() => fetchGroupDetails()}
      />

      {/* Delete Group Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteGroup}
        title="Disband Group?"
        message="Are you sure you want to delete this group? All group records and assignments association will be removed. This cannot be undone."
        confirmText="Disband Group"
        variant="danger"
        isLoading={isActionLoading}
      />

      {/* Leave Group Modal */}
      <ConfirmDialog
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onConfirm={handleLeaveGroup}
        title="Leave Group?"
        message="Are you sure you want to leave this study group? You will lose access to team submissions."
        confirmText="Leave Group"
        variant="danger"
        isLoading={isActionLoading}
      />
    </DashboardLayout>
  );
}
