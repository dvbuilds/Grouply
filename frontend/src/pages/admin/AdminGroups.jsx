import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { getAllGroupsApi, getGroupMembersApi } from '../../api/groups.js';
import { getOverviewAnalyticsApi } from '../../api/analytics.js';
import { Users, Crown, Search, Eye, ShieldCheck } from 'lucide-react';
import { getInitials } from '../../utils/formatters.js';

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [completionByGroup, setCompletionByGroup] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const [groupsData, analytics] = await Promise.all([
        getAllGroupsApi(),
        getOverviewAnalyticsApi().catch(() => null),
      ]);
      setGroups(groupsData || []);

      if (analytics?.perGroup) {
        const map = {};
        analytics.perGroup.forEach((g) => {
          map[g.id] = g.total ? Math.round((g.confirmed / g.total) * 100) : 0;
        });
        setCompletionByGroup(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleViewMembers = async (group) => {
    setSelectedGroup(group);
    setIsMembersModalOpen(true);
    try {
      const members = await getGroupMembersApi(group.id);
      setGroupMembers(members || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.leader_name && g.leader_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout
      title="Student Groups Directory"
      subtitle="Overview of all student cohorts and leaders"
    >
      <div className="space-y-6 pb-12">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#e1e3e4] soft-shadow">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d]">Cohort Roster</h3>
            <p className="text-xs text-[#717973] mt-0.5">{groups.length} groups registered</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Search by group or leader name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-full bg-[#f8f9fa] border border-[#e1e3e4] focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10 outline-none transition-all"
            />
          </div>
        </div>

        {}
        {isLoading ? (
          <div className="text-center py-20 text-[#717973] text-sm">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#e1e3e4]">
            <Users className="w-10 h-10 text-[#c1c8c2] mx-auto mb-3" />
            <p className="text-sm text-[#717973]">No groups found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const completion = completionByGroup[group.id] ?? 0;
              return (
                <div
                  key={group.id}
                  className="bg-white rounded-3xl p-6 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#012d1d]/10 text-[#012d1d] flex items-center justify-center font-bold text-lg">
                      {group.name?.charAt(0) || 'G'}
                    </div>
                    <Badge variant="neutral">{group.member_count || 0} members</Badge>
                  </div>

                  <h4 className="font-bold text-base text-[#191c1d] mb-1">{group.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#717973] mb-4">
                    <Crown className="w-3.5 h-3.5 text-[#FB8500]" />
                    <span>{group.leader_name || 'Unassigned'}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#717973]">Submission Completion</span>
                      <span className="font-bold text-[#191c1d]">{completion}%</span>
                    </div>
                    <ProgressBar value={completion} color="auto" size="sm" />
                  </div>

                  <button
                    onClick={() => handleViewMembers(group)}
                    className="mt-auto flex items-center justify-center gap-2 text-xs font-semibold text-[#012d1d] bg-[#012d1d]/5 hover:bg-[#012d1d]/10 rounded-xl py-2.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Members
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title={selectedGroup?.name || 'Group Members'}
        subtitle="Roster and roles"
        icon={Users}
        maxWidth="max-w-md"
      >
        <div className="space-y-2">
          {groupMembers.map((member) => {
            const isLeader = member.id === selectedGroup?.leader_id;
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f9fa] border border-[#e1e3e4]/60"
              >
                <div className="w-9 h-9 rounded-full bg-[#012d1d] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#191c1d] truncate">{member.name}</p>
                  <p className="text-xs text-[#717973] truncate">{member.email}</p>
                </div>
                {isLeader && (
                  <Badge variant="warning" dot>
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    Leader
                  </Badge>
                )}
              </div>
            );
          })}
          {groupMembers.length === 0 && (
            <p className="text-xs text-[#717973] text-center py-4">No members yet.</p>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
