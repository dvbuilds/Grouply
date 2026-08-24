import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { getAllAssignmentsApi } from '../../api/assignments.js';
import {
  getAssignmentSubmissionsApi,
  getAssignmentStudentSubmissionsApi,
} from '../../api/submissions.js';
import {
  CheckSquare,
  Users,
  User,
  CheckCircle2,
  Clock,
  Filter,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { getInitials, formatDate } from '../../utils/formatters.js';

export default function AdminSubmissionTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAssignmentId = searchParams.get('assignmentId') || '1';

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId);
  const [viewMode, setViewMode] = useState('groups'); // 'groups' | 'students'
  const [groupSubmissions, setGroupSubmissions] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch list of all assignments for selector
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const list = await getAllAssignmentsApi();
        setAssignments(list || []);
        if (list?.length && !searchParams.get('assignmentId')) {
          setSelectedAssignmentId(String(list[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignments();
  }, []);

  // Fetch submissions whenever selected assignment or viewMode changes
  useEffect(() => {
    if (!selectedAssignmentId) return;

    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        if (viewMode === 'groups') {
          const data = await getAssignmentSubmissionsApi(selectedAssignmentId);
          setGroupSubmissions(data || []);
        } else {
          const data = await getAssignmentStudentSubmissionsApi(selectedAssignmentId);
          setStudentSubmissions(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
    setSearchParams({ assignmentId: selectedAssignmentId });
  }, [selectedAssignmentId, viewMode]);

  const currentAssignment = assignments.find(
    (a) => String(a.id) === String(selectedAssignmentId)
  );

  const confirmedGroupCount = groupSubmissions.filter((g) => g.status === 'confirmed').length;
  const totalGroupCount = groupSubmissions.length;
  const completionPercentage = totalGroupCount > 0 ? Math.round((confirmedGroupCount / totalGroupCount) * 100) : 0;

  return (
    <DashboardLayout
      title="Submission Tracker"
      subtitle="Verify group and individual student submissions in real-time"
    >
      <div className="space-y-6 pb-12">
        {/* Top Assignment Selector Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#717973] uppercase tracking-wider">
              Select Target Assignment
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="font-bold text-base md:text-lg text-[#191c1d] bg-transparent border-b-2 border-[#012d1d] pb-1 pr-8 outline-none cursor-pointer focus:border-[#2D6A4F]"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} (Due: {new Date(a.due_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 bg-[#f8f9fa] p-4 rounded-2xl border border-[#e1e3e4]">
            <div>
              <p className="text-[11px] text-[#717973] uppercase font-bold">Group Completion</p>
              <p className="text-xl font-bold text-[#012d1d]">
                {confirmedGroupCount} / {totalGroupCount} ({completionPercentage}%)
              </p>
            </div>
            <div className="w-24">
              <ProgressBar value={completionPercentage} color="auto" size="md" />
            </div>
          </div>
        </div>

        {/* View Mode Switcher and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-[#e1e3e4] p-1 rounded-2xl soft-shadow">
            <button
              onClick={() => setViewMode('groups')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'groups'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'text-[#717973] hover:text-[#191c1d]'
              }`}
            >
              <Users className="w-4 h-4" />
              Group Status View
            </button>
            <button
              onClick={() => setViewMode('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'students'
                  ? 'bg-[#012d1d] text-white shadow-xs'
                  : 'text-[#717973] hover:text-[#191c1d]'
              }`}
            >
              <User className="w-4 h-4" />
              Student-wise Breakdown
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting submission log CSV...')}
            icon={FileSpreadsheet}
          >
            Export Gradebook
          </Button>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-3xl border border-[#e1e3e4] overflow-hidden soft-shadow">
          {viewMode === 'groups' ? (
            /* Groups View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e1e3e4] text-[11px] font-semibold text-[#717973] uppercase tracking-wider">
                    <th className="py-4 px-6">Group Name</th>
                    <th className="py-4 px-6">Leader</th>
                    <th className="py-4 px-6">Members</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Confirmed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f5] text-xs">
                  {groupSubmissions.map((group) => {
                    const isConfirmed = group.status === 'confirmed';

                    return (
                      <tr key={group.id || group.group_id} className="hover:bg-[#f8f9fa]">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#012d1d]/10 text-[#012d1d] font-bold flex items-center justify-center text-xs">
                              {group.name?.charAt(0) || 'G'}
                            </div>
                            <span className="font-bold text-sm text-[#191c1d]">{group.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#414844]">
                          {group.leader_name || 'Group Leader'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-[#717973] font-medium">
                            {group.member_count || group.members?.length || 1} students
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {isConfirmed ? (
                            <Badge variant="success" dot>
                              Confirmed
                            </Badge>
                          ) : (
                            <Badge variant="warning" dot>
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-[#717973]">
                          {isConfirmed && group.submitted_at
                            ? new Date(group.submitted_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Students View */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e1e3e4] text-[11px] font-semibold text-[#717973] uppercase tracking-wider">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Student ID</th>
                    <th className="py-4 px-6">Assigned Group</th>
                    <th className="py-4 px-6">Individual Status</th>
                    <th className="py-4 px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f5] text-xs">
                  {studentSubmissions.map((student) => {
                    const isConfirmed = student.status === 'confirmed';

                    return (
                      <tr key={student.id || student.email} className="hover:bg-[#f8f9fa]">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#012d1d]/10 text-[#012d1d] font-bold text-xs flex items-center justify-center">
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <p className="font-bold text-[#191c1d]">{student.name}</p>
                              <p className="text-[11px] text-[#717973]">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-[#414844]">
                          {student.student_id || '—'}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="neutral">{student.group_name || 'Group'}</Badge>
                        </td>
                        <td className="py-4 px-6">
                          {isConfirmed ? (
                            <Badge variant="success" dot>
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="warning" dot>
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right text-[#717973] font-mono">
                          {isConfirmed && student.submitted_at
                            ? new Date(student.submitted_at).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
