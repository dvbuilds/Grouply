import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { getMyAssignmentsApi } from '../../api/assignments.js';
import { getMyGroupsApi } from '../../api/groups.js';
import {
  BookOpen,
  GraduationCap,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Plus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [calendarView, setCalendarView] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(4);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignData, groupData] = await Promise.all([
          getMyAssignmentsApi(),
          getMyGroupsApi(),
        ]);
        setAssignments(assignData || []);
        setGroups(groupData || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const weekDays = [
    { label: 'Mon', day: 1 },
    { label: 'Tue', day: 2 },
    { label: 'Wed', day: 3 },
    { label: 'Thu', day: 4 },
    { label: 'Fri', day: 5 },
    { label: 'Sat', day: 6 },
    { label: 'Sun', day: 7 },
  ];

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Student'}`}
      subtitle="Student Dashboard"
    >
      <div className="flex flex-col lg:flex-row gap-6 pb-12">
        {/* Left Column (Main Feed & Courses) */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Hero Banner (Academic Clarity Primary Forest Green) */}
          <div className="bg-[#012d1d] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden soft-shadow">
            <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#1b4332] rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="relative z-10 max-w-md">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Learn today,
                <br />
                succeed tomorrow!
              </h3>
              <p className="text-xs md:text-sm text-[#a5d0b9] leading-relaxed mb-6">
                Discover new features for smart learning platform designed to help you collaborate with your group and achieve your academic goals.
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

            {/* 3D Geometric Aesthetic Representation */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none opacity-90">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-[#ffb702]/80 animate-pulse" />
                <div className="absolute w-20 h-20 rounded-2xl bg-[#4361EE] -rotate-12 opacity-80" />
                <div className="absolute w-12 h-12 rounded-full bg-[#d3bcfc] translate-x-8 -translate-y-8" />
              </div>
            </div>
          </div>

          {/* Bento Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* New Courses */}
            <div className="bg-[#ffb702] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 text-[#6b4b00]">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide text-[#6b4b00]">
                <BookOpen className="w-4 h-4" />
                <span>New courses</span>
              </div>
              <div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-bold text-[#271900]">+2</span>
                  <span className="bg-white/50 text-[#271900] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                    <ArrowUpRight className="w-3 h-3" />
                    40%
                  </span>
                </div>
                <p className="text-xs text-[#6b4b00]/90">3 new courses started</p>
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-[#4361EE] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 text-white">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide text-white/90">
                <GraduationCap className="w-4 h-4" />
                <span>Course progress</span>
              </div>
              <div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-bold">50%</span>
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                    <ArrowUpRight className="w-3 h-3" />
                    18%
                  </span>
                </div>
                <p className="text-xs text-white/80">of your courses are done</p>
              </div>
            </div>

            {/* Assignments Progress */}
            <div className="bg-[#453268] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 text-white">
              <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide text-white/90">
                <FileText className="w-4 h-4" />
                <span>Assignments</span>
              </div>
              <div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-bold">89%</span>
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                    <ArrowUpRight className="w-3 h-3" />
                    10%
                  </span>
                </div>
                <p className="text-xs text-white/80">Based on recent tasks</p>
              </div>
            </div>
          </div>

          {/* Active Courses Section */}
          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg text-[#191c1d]">Active Courses</h3>
                <span className="text-xs bg-[#e1e3e4] text-[#414844] font-semibold px-2.5 py-0.5 rounded-full">
                  5 courses
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Course Card 1: JS Basics */}
              <div
                onClick={() => navigate('/student/assignments/1')}
                className="bg-white rounded-2xl p-5 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col cursor-pointer group"
              >
                <h4 className="font-bold text-sm text-[#191c1d] group-hover:text-[#012d1d] transition-colors">
                  JavaScript Basics
                </h4>
                <p className="text-xs text-[#717973] mb-4">13/35 lessons</p>
                <div className="h-28 flex items-center justify-center my-2 relative">
                  <div className="w-20 h-20 rounded-full border-8 border-[#ffb702] border-t-[#D90429] flex items-center justify-center shadow-inner group-hover:rotate-45 transition-transform duration-500">
                    <span className="text-xs font-bold text-[#191c1d]">JS</span>
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-[#f3f4f5]">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[#717973]">37% complete</span>
                  </div>
                  <ProgressBar value={37} color="accent" size="sm" />
                </div>
              </div>

              {/* Course Card 2: HTML Basics */}
              <div
                onClick={() => navigate('/student/assignments/2')}
                className="bg-white rounded-2xl p-5 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col cursor-pointer group"
              >
                <h4 className="font-bold text-sm text-[#191c1d] group-hover:text-[#012d1d] transition-colors">
                  HTML & CSS Basics
                </h4>
                <p className="text-xs text-[#717973] mb-4">13/25 lessons</p>
                <div className="h-28 flex items-center justify-center my-2 relative">
                  <div className="flex gap-2 items-end">
                    <div className="w-6 h-16 bg-[#2D6A4F] rounded-t-lg" />
                    <div className="w-6 h-22 bg-[#a5d0b9] rounded-t-lg" />
                    <div className="w-6 h-12 bg-[#012d1d] rounded-t-lg" />
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-[#f3f4f5]">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[#717973]">55% complete</span>
                  </div>
                  <ProgressBar value={55} color="success" size="sm" />
                </div>
              </div>

              {/* Course Card 3: UI/UX Design */}
              <div
                onClick={() => navigate('/student/assignments/3')}
                className="bg-white rounded-2xl p-5 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col cursor-pointer group"
              >
                <h4 className="font-bold text-sm text-[#191c1d] group-hover:text-[#012d1d] transition-colors">
                  UI/UX Design
                </h4>
                <p className="text-xs text-[#717973] mb-4">10/25 lessons</p>
                <div className="h-28 flex items-center justify-center my-2 relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#ebdcff] border-2 border-[#d3bcfc] flex items-center justify-center text-[#2e1b50] font-bold shadow-xs">
                    🎨
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-[#f3f4f5]">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[#717973]">40% complete</span>
                  </div>
                  <ProgressBar value={40} color="warning" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar & Homework Widget */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {/* Mini Calendar Widget */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 soft-shadow border border-[#e1e3e4]">
            {/* View toggle */}
            <div className="bg-[#f3f4f5] rounded-xl p-1 flex mb-5 text-xs font-semibold">
              <button
                onClick={() => setCalendarView('weekly')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  calendarView === 'weekly'
                    ? 'bg-[#012d1d] text-white shadow-xs'
                    : 'text-[#717973] hover:text-[#191c1d]'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setCalendarView('monthly')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  calendarView === 'monthly'
                    ? 'bg-[#012d1d] text-white shadow-xs'
                    : 'text-[#717973] hover:text-[#191c1d]'
                }`}
              >
                Monthly
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#191c1d]">September 2026</h3>
              <span className="text-xs font-bold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* Days strip */}
            <div className="grid grid-cols-7 gap-1 text-center mb-6">
              {weekDays.map((item) => {
                const isSelected = selectedDay === item.day;
                return (
                  <button
                    key={item.day}
                    onClick={() => setSelectedDay(item.day)}
                    className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#012d1d] text-white shadow-sm font-bold'
                        : 'hover:bg-[#f3f4f5] text-[#414844]'
                    }`}
                  >
                    <span className="text-[10px] text-current opacity-80">{item.label}</span>
                    <span className="text-sm mt-0.5">{item.day}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#f3f4f5]">
              <button
                onClick={() => alert('Add note dialog')}
                className="text-xs font-semibold text-[#414844] hover:text-[#012d1d] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add note
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/student/assignments')}
              >
                New event
              </Button>
            </div>
          </div>

          {/* Homework Progress Widget */}
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
              {assignments.slice(0, 3).map((item) => (
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
                        value={item.is_submitted ? 100 : 35}
                        color={item.is_submitted ? 'success' : 'accent'}
                        size="sm"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#191c1d]">
                      {item.is_submitted ? '100%' : '35%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
