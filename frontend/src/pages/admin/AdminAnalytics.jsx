import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatCard from '../../components/analytics/StatCard.jsx';
import CompletionBarChart from '../../components/analytics/CompletionBarChart.jsx';
import GroupPerformanceBars from '../../components/analytics/GroupPerformanceBars.jsx';
import { getOverviewAnalyticsApi } from '../../api/analytics.js';
import {
  GraduationCap,
  Users,
  FileText,
  TrendingUp,
  Award,
  Sparkles,
  BarChart2,
  Calendar,
} from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('semester');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await getOverviewAnalyticsApi();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <DashboardLayout
      title="Cohort Analytics & Insights"
      subtitle="Comprehensive performance indicators and completion metrics"
    >
      <div className="space-y-6 pb-12">
        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 md:p-6 border border-[#e1e3e4] soft-shadow">
          <div>
            <h3 className="font-bold text-base text-[#191c1d]">Performance Overview</h3>
            <p className="text-xs text-[#717973]">Real-time synchronized data</p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f3f4f5] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'week' ? 'bg-[#012d1d] text-white shadow-xs' : 'text-[#717973]'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'month' ? 'bg-[#012d1d] text-white shadow-xs' : 'text-[#717973]'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('semester')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'semester' ? 'bg-[#012d1d] text-white shadow-xs' : 'text-[#717973]'
              }`}
            >
              Full Semester
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Class Attendance"
            value="94.2%"
            subtitle="Active weekly participation"
            trend="+3.1% vs target"
            icon={GraduationCap}
          />
          <StatCard
            title="Average Grade"
            value="3.82"
            subtitle="GPA benchmark"
            trend="Upper quartile"
            icon={Award}
            variant="gold"
          />
          <StatCard
            title="On-Time Rate"
            value="88.5%"
            subtitle="Assignments submitted on time"
            trend="+5.2% improvement"
            icon={TrendingUp}
            variant="accent"
          />
          <StatCard
            title="Completion Index"
            value="76%"
            subtitle="Group deliverables finalized"
            trend="+8% from midterm"
            icon={BarChart2}
            variant="primary"
          />
        </div>

        {/* Big Chart + Group Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#191c1d]">
                  Assignment Completion Velocity
                </h3>
                <p className="text-xs text-[#717973]">
                  Percentage of active groups submitting before deadline
                </p>
              </div>
            </div>
            <CompletionBarChart
              data={
                analytics?.completion_by_assignment || [
                  { shortTitle: 'JS Basics', title: 'JavaScript Basics', completion: 92 },
                  { shortTitle: 'HTML/CSS', title: 'HTML & CSS Layouts', completion: 78 },
                  { shortTitle: 'UI/UX', title: 'UI/UX Design Systems', completion: 64 },
                  { shortTitle: 'Data Struct', title: 'Data Structures', completion: 41 },
                ]
              }
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow space-y-4">
            <h3 className="font-bold text-base text-[#191c1d]">Cohort Rankings</h3>
            <GroupPerformanceBars
              groups={
                analytics?.group_performance || [
                  { name: 'Alpha Cohort', completion: 92 },
                  { name: 'Beta Squad', completion: 78 },
                  { name: 'Gamma Team', completion: 64 },
                  { name: 'Delta Force', completion: 41 },
                ]
              }
            />

            <div className="p-4 bg-[#f8f9fa] rounded-2xl border border-[#e1e3e4] text-xs text-[#414844] space-y-2 mt-4">
              <div className="flex items-center gap-1.5 font-bold text-[#012d1d]">
                <Sparkles className="w-3.5 h-3.5 text-[#FB8500]" />
                <span>Insight Recommendation</span>
              </div>
              <p className="text-[#717973] leading-relaxed">
                Delta Force has 2 pending submissions for the upcoming deadline. A reminder email was queued.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
