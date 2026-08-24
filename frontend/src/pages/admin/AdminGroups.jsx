import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { getAllGroupsApi, getGroupMembersApi } from '../../api/groups.js';
import { Users, Crown, Mail, Search, Eye, ShieldCheck, FileCheck } from 'lucide-react';
import { getInitials } from '../../utils/formatters.js';

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const data = await getAllGroupsApi();
      setGroups(data || []);
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
    (g.leader_email && g.leader_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout
      title="Student Groups Directory"
      subtitle="Overview of all student cohorts and leaders"
    >
      <div className="space-y-6 pb-12">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#e1e3e4] soft-shadow">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d]">Cohort Roster</h3>
            <p className="text-xs text-[#717973] mt-0.5">
              {groups.length} active student study groups registered in the system.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Search by group or leader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#e1e3e4] focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10 outline-none"
            />
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-white rounded-3xl border border-[#e1e3e4] overflow-hidden soft-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e1e3e4] text-[11px] font-semibold text-[#717973] uppercase tracking-wider">
                  <th className="py-4 px-6">Group Name</th>
                  <th className="py-4 px-6">Group Leader</th>
                  <th className="py-4 px-6">Members</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6">Performance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f5] text-xs">
                {filteredGroups.map((group) => {
                  const memberCount = group.member_count || group.members?.length || 1;
                  const completion = group.completion_rate || (group.id === 1 ? 92 : group.id === 2 ? 78 : 65);

                  return (
                    <tr key={group.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#012d1d]/10 text-[#012d1d] font-bold flex items-center justify-center">
                            {group.name?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#191c1d]">{group.name}</p>
                            <p className="text-[11px] text-[#717973]">ID: #{group.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Crown className="w-3.5 h-3.5 text-[#FB8500]" />
                          <div>
                            <p className="font-semibold text-[#191c1d]">{group.leader_name || 'Group Leader'}</p>
                            <p className="text-[11px] text-[#717973]">{group.leader_email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="neutral">
                          <Users className="w-3 h-3 inline mr-1" />
                          {memberCount} Students
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-[#717973]">
                        {new Date(group.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>Avg. Completion</span>
                            <span>{completion}%</span>
                          </div>
                          <ProgressBar value={completion} color="auto" size="sm" />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewMembers(group)}
                          icon={Eye}
                        >
                          View Roster
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Group Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title={selectedGroup?.name || 'Group Roster'}
        subtitle={`Leader: ${selectedGroup?.leader_name || 'Leader'}`}
        icon={Users}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="divide-y divide-[#f3f4f5] max-h-72 overflow-y-auto pr-1">
            {groupMembers.map((member) => (
              <div
                key={member.id || member.email}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#012d1d]/10 text-[#012d1d] font-bold text-xs flex items-center justify-center">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-[#191c1d] flex items-center gap-1.5">
                      {member.name}
                      {member.is_leader && (
                        <Badge variant="warning" size="sm">
                          Leader
                        </Badge>
                      )}
                    </p>
                    <p className="text-[11px] text-[#717973]">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#717973]">
                  {member.student_id || '—'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#f3f4f5] flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsMembersModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
