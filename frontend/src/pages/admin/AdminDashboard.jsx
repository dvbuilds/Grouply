import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatCard from '../../components/analytics/StatCard.jsx';
import CompletionBarChart from '../../components/analytics/CompletionBarChart.jsx';
import GroupPerformanceBars from '../../components/analytics/GroupPerformanceBars.jsx';
import Button from '../../components/ui/Button.jsx';
import CreateAssignmentModal from '../../components/assignments/CreateAssignmentModal.jsx';
import { getOverviewAnalyticsApi } from '../../api/analytics.js';
import { getAllAssignmentsApi } from '../../api/assignments.js';
import { getAllGroupsApi } from '../../api/groups.js';
import {
  Users,
  GraduationCap,
  FilePlus,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, assignData, groupData] = await Promise.all([
        getOverviewAnalyticsApi(),
        getAllAssignmentsApi(),
        getAllGroupsApi(),
      ]);
      setAnalytics(statsData);
      setAssignments(assignData || []);
      setGroups(groupData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = analytics?.totals || {};
  const overallCompletion = totals.total_submissions
    ? Math.round((totals.confirmed_submissions / totals.total_submissions) * 100)
    : 0;

  const completionByAssignmentId = {};
  (analytics?.perAssignment || []).forEach((a) => {
    completionByAssignmentId[a.id] = a.target_groups
      ? Math.round((a.confirmed_groups / a.target_groups) * 100)
      : 0;
  });

  const completionChartData = (analytics?.perAssignment || []).map((a) => ({
    shortTitle: a.title.length > 12 ? `${a.title.slice(0, 12)}…` : a.title,
    title: a.title,
    completion: a.target_groups ? Math.round((a.confirmed_groups / a.target_groups) * 100) : 0,
  }));

  const groupPerformanceData = (analytics?.perGroup || []).map((g) => ({
    name: g.name,
    completion: g.total ? Math.round((g.confirmed / g.total) * 100) : 0,
  }));

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Institutional Analytics & Assignment Operations"
    >
      <div className="space-y-6 pb-12">
        {}
        <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d]">Course Overview & Controls</h3>
            <p className="text-xs text-[#717973] mt-0.5">
              Deploy assignments to groups, monitor real-time submissions, and track class progress.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setIsCreateAssignmentOpen(true)}
              icon={Plus}
            >
              New Assignment
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/submissions')}
              icon={CheckCircle2}
            >
              Track Submissions
            </Button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={totals.total_students ?? 0}
            subtitle="Enrolled across all groups"
            icon={GraduationCap}
          />
          <StatCard
            title="Active Groups"
            value={totals.total_groups ?? groups.length}
            subtitle="Study teams & project pods"
            icon={Users}
            variant="gold"
          />
          <StatCard
            title="Assignments"
            value={totals.total_assignments ?? assignments.length}
            subtitle="Coursework items deployed"
            icon={FilePlus}
            variant="accent"
          />
          <StatCard
            title="Class Completion"
            value={`${overallCompletion}%`}
            subtitle={`${totals.confirmed_submissions ?? 0} of ${totals.total_submissions ?? 0} submissions confirmed`}
            icon={TrendingUp}
            variant="primary"
          />
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[#191c1d]">
                  Assignment Completion Rate
                </h3>
                <p className="text-xs text-[#717973]">
                  Percentage of student groups who confirmed submissions
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/assignments')}
              >
                View all
              </Button>
            </div>

            <CompletionBarChart data={completionChartData} />
          </div>

          {}
          <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-[#191c1d]">
                  Group Performance
                </h3>
                <span className="text-xs font-bold text-[#012d1d] bg-[#012d1d]/10 px-2 py-0.5 rounded-full">
                  Rankings
                </span>
              </div>

              <GroupPerformanceBars groups={groupPerformanceData} />
            </div>

            <div className="pt-4 mt-6 border-t border-[#f3f4f5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/groups')}
                className="w-full flex items-center justify-between"
              >
                <span>Manage All Groups</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-[#191c1d]">Active Coursework</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateAssignmentOpen(true)}
              icon={Plus}
            >
              Add Assignment
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e1e3e4] text-[11px] font-semibold text-[#717973] uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Target Scope</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Completion</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f5] text-xs">
                {assignments.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8f9fa]">
                    <td className="py-3.5 px-4 font-bold text-[#191c1d]">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#e1e3e4] text-[#414844] font-semibold px-2 py-0.5 rounded-full capitalize">
                        {item.target_scope === 'all' ? 'All Groups' : 'Specific Groups'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#717973]">
                      {new Date(item.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#191c1d]">
                          {completionByAssignmentId[item.id] ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/submissions?assignmentId=${item.id}`)}
                      >
                        Submissions
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setIsCreateAssignmentOpen(false)}
        allGroups={groups}
        onSaved={() => fetchData()}
      />
    </DashboardLayout>
  );
}
