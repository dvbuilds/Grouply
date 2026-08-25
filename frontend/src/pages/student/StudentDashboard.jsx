import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { getMyAssignmentsApi } from '../../api/assignments.js';
import { getMyGroupsApi } from '../../api/groups.js';
import { attachSubmissionStatus } from '../../utils/assignmentStatus.js';
import {
  BookOpen,
  GraduationCap,
  FileText,
  ArrowUpRight,
  ChevronRight,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignData, groupData] = await Promise.all([
          getMyAssignmentsApi(),
          getMyGroupsApi(),
        ]);
        const withStatus = await attachSubmissionStatus(assignData || []);
        setAssignments(withStatus);
        setGroups(groupData || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const upcomingCount = assignments.filter((a) => {
    const due = new Date(a.due_date);
    return due >= now && !a.is_submitted;
  }).length;
  const submittedCount = assignments.filter((a) => a.is_submitted).length;
  const completionRate = assignments.length
    ? Math.round((submittedCount / assignments.length) * 100)
    : 0;

  const upcomingAssignments = [...assignments]
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'}`}
      subtitle="Student Dashboard"
    >
      <div className="flex flex-col lg:flex-row gap-6 pb-12">
        {/* Left Column (Main Feed) */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Hero Banner */}
          <div className="bg-[#012d1d] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden soft-shadow">
            <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#1b4332] rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="relative z-10 max-w-md">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Learn today,
                <br />
                succeed tomorrow!
              </h3>
              <p className="text-xs md:text-sm text-[#a5d0b9] leading-relaxed mb-6">
                Track your assignments, collaborate with your group, and confirm submissions
                before their deadlines.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="white"
                  size="md"
                  onClick={() => navigate('/student/assignments')}
                  icon={Sparkles}
                >
                  Explore Assignments
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/student/groups')}
                  className="text-white hover:bg-white/10"
                >
                  My Cohort
                </Button>
              </div>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none opacity-90">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-[#ffb702]/80 animate-pulse" />
                <div className="absolute w-20 h-20 rounded-2xl bg-[#4361EE] -rotate-12 opacity-80" />
                <div className="absolute w-12 h-12 rounded-full bg-[#d3bcfc] translate-x-8 -translate-y-8" />
              </div>
            </div>
          </div>

          {/* Bento Grid Stats — real numbers from the student's own data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#ffb702] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 text-[#6b4b00]">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide text-[#6b4b00]">
                <BookOpen className="w-4 h-4" />
                <span>My Groups</span>
              </div>
              <div>
                <span className="text-3xl font-bold text-[#271900]">{groups.length}</span>
                <p className="text-xs text-[#6b4b00]/90 mt-1">
                  {groups.length === 1 ? 'group you belong to' : 'groups you belong to'}
                </p>
              </div>
            </div>

            <div className="bg-[#4361EE] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 text-white">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide text-white/90">
                <GraduationCap className="w-4 h-4" />
                <span>Submission rate</span>
              </div>
              <div>
                <span className="text-3xl font-bold">{completionRate}%</span>
                <p className="text-xs text-white/80 mt-1">
                  {submittedCount} of {assignments.length} confirmed
                </p>
              </div>
            </div>

            <div className="bg-[#453268] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 text-white">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide text-white/90">
                <FileText className="w-4 h-4" />
                <span>Pending</span>
              </div>
              <div>
                <span className="text-3xl font-bold">{upcomingCount}</span>
                <p className="text-xs text-white/80 mt-1">assignments awaiting submission</p>
              </div>
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-[#191c1d]">Upcoming Assignments</h3>
                <span className="text-xs bg-[#e1e3e4] text-[#414844] font-semibold px-2.5 py-0.5 rounded-full">
                  {assignments.length} total
                </span>
              </div>
              <button
                onClick={() => navigate('/student/assignments')}
                className="text-xs font-semibold text-[#012d1d] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {upcomingAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#e1e3e4] text-sm text-[#717973]">
                No assignments yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingAssignments.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/student/assignments/${item.id}`)}
                    className="bg-white rounded-2xl p-5 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-sm text-[#191c1d] group-hover:text-[#012d1d] transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      {item.is_submitted ? (
                        <Badge variant="success" dot>Done</Badge>
                      ) : (
                        <Badge variant="warning" dot>Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#717973] mb-4 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due {formatDate(item.due_date)}
                    </p>
                    {item.onedrive_link && (
                      <a
                        href={item.onedrive_link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-auto text-xs text-[#4361EE] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Starter files</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Homework Progress Widget */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 soft-shadow border border-[#e1e3e4] flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#191c1d]">Homework Progress</h3>
              <button
                onClick={() => navigate('/student/assignments')}
                className="text-xs text-[#717973] hover:text-[#012d1d] font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {assignments.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/student/assignments/${item.id}`)}
                  className="border border-[#e1e3e4] rounded-2xl p-4 hover:border-[#012d1d]/40 transition-colors bg-white cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#191c1d] group-hover:text-[#012d1d]">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#717973] mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(item.due_date)}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#717973] group-hover:text-[#012d1d] transition-colors" />
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar
                        value={item.is_submitted ? 100 : 0}
                        color={item.is_submitted ? 'success' : 'accent'}
                        size="sm"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#191c1d]">
                      {item.is_submitted ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <p className="text-xs text-[#717973] text-center py-4">No assignments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
