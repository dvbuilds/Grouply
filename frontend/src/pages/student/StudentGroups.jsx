import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import CreateGroupModal from '../../components/groups/CreateGroupModal.jsx';
import { getMyGroupsApi } from '../../api/groups.js';
import { Users, Plus, Crown, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { getInitials } from '../../utils/formatters.js';

export default function StudentGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const data = await getMyGroupsApi();
      setGroups(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user?.id]);

  return (
    <DashboardLayout
      title="My Study Groups"
      subtitle="Collaborate with your student cohort"
    >
      <div className="space-y-6 pb-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#e1e3e4] soft-shadow">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d]">Active Cohorts & Teams</h3>
            <p className="text-xs text-[#717973] mt-0.5">
              Manage your project groups, team members, and group assignment deliverables.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            icon={Plus}
          >
            Create New Group
          </Button>
        </div>

        {/* Group Cards Grid */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e1e3e4] max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#012d1d]/10 text-[#012d1d] flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#191c1d] mb-1">No groups yet</h3>
            <p className="text-xs text-[#717973] mb-6 leading-relaxed">
              You aren't a member of any study group. Create a group to collaborate with your classmates or ask a group leader to add you by email.
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreateOpen(true)}
              icon={Plus}
            >
              Create Your First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const isLeader = group.is_leader || group.leader_id === user?.id;

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-3xl p-6 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#012d1d]/10 text-[#012d1d] flex items-center justify-center font-bold text-lg">
                        {group.name?.charAt(0) || 'G'}
                      </div>
                      {isLeader ? (
                        <Badge variant="warning" dot>
                          <Crown className="w-3 h-3 text-[#FB8500] inline mr-1" />
                          Group Leader
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Member</Badge>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-[#191c1d] mb-1">
                      {group.name}
                    </h4>
                    <p className="text-xs text-[#717973] mb-4">
                      Leader: {group.leader_name || 'Leader'}
                    </p>

                    <div className="bg-[#f8f9fa] rounded-2xl p-3.5 border border-[#e1e3e4]/60 space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#717973]">Members</span>
                        <span className="font-bold text-[#191c1d]">
                          {group.member_count || group.members?.length || 1} Students
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#717973]">Created</span>
                        <span className="text-[#414844]">
                          {new Date(group.created_at || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f3f4f5]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/student/groups/${group.id}`)}
                      className="w-full flex items-center justify-between"
                    >
                      <span>Manage & Members</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onGroupCreated={() => fetchGroups()}
      />
    </DashboardLayout>
  );
}
