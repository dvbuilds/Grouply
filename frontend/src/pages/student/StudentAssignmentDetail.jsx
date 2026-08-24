import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import SubmissionConfirmModal from '../../components/assignments/SubmissionConfirmModal.jsx';
import { getMyAssignmentsApi } from '../../api/assignments.js';
import {
  ChevronLeft,
  Clock,
  ExternalLink,
  CheckCircle2,
  Play,
  Volume2,
  Maximize2,
  FileText,
  Sparkles,
  Bot,
  Star,
  User,
  HelpCircle,
  BookOpen,
  Lock,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'review' | 'instructor' | 'faq'
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignmentData = async () => {
    try {
      setIsLoading(true);
      const list = await getMyAssignmentsApi();
      const item = (list || []).find((a) => String(a.id) === String(id));
      if (item) {
        setAssignment(item);
      } else {
        // Fallback default
        setAssignment({
          id: id,
          title: 'JavaScript Basics & Advanced Patterns',
          description:
            'Master JavaScript fundamentals, asynchronous operations, array manipulation, and modern web application development patterns with your cohort.',
          due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
          onedrive_link: 'https://onedrive.live.com/view/javascript-basics',
          group_id: 1,
          group_name: 'Alpha Cohort',
          is_submitted: false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, [id]);

  const handleSubmissionSuccess = () => {
    fetchAssignmentData();
  };

  const isSubmitted = assignment?.is_submitted;

  const notesList = [
    { time: '6:12', title: 'Lexical Environment & Variable Hoisting', tag: 'Core Concept' },
    { time: '5:14', title: 'Event Loop, Microtasks & Macro-queues', tag: 'Async' },
    { time: '3:10', title: 'Array Methods: map, filter, reduce benchmarks', tag: 'Practice' },
    { time: '2:10', title: 'DOM Mutation and Shadow DOM Tree', tag: 'Web API' },
  ];

  const courseModules = [
    { id: 1, title: '1. Introduction to JavaScript Engine', duration: '12 mins', status: 'completed' },
    { id: 2, title: '2. DOM & Event Listeners', duration: '18 mins', status: 'active' },
    { id: 3, title: '3. Asynchronous JavaScript & Promises', duration: '24 mins', status: 'locked' },
    { id: 4, title: '4. REST APIs and State Architecture', duration: '30 mins', status: 'locked' },
  ];

  return (
    <DashboardLayout
      title={assignment?.title || 'Assignment Details'}
      subtitle="Coursework & Interactive Lecture"
    >
      <div className="space-y-6 pb-16">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/student/assignments')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#414844] hover:text-[#012d1d] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </button>

        {/* Hero header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e1e3e4] soft-shadow flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#012d1d] bg-[#012d1d]/10 px-3 py-1 rounded-full">
                {assignment?.group_name || 'Group Project'}
              </span>
              {isSubmitted ? (
                <Badge variant="success" dot>
                  Submitted & Confirmed
                </Badge>
              ) : (
                <Badge variant="warning" dot>
                  Submission Pending
                </Badge>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d] tracking-tight">
              {assignment?.title}
            </h2>

            <p className="text-xs md:text-sm text-[#414844] leading-relaxed">
              {assignment?.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex md:flex-col justify-end items-end gap-3 text-right">
            <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-[#e1e3e4] w-full md:w-56 text-left">
              <p className="text-[11px] text-[#717973] uppercase font-semibold">Deadline</p>
              <p className="text-xs font-bold text-[#191c1d] mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FB8500]" />
                {assignment?.due_date ? formatDate(assignment.due_date) : 'Upcoming'}
              </p>
              {assignment?.onedrive_link && (
                <a
                  href={assignment.onedrive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#4361EE] hover:underline"
                >
                  <span>OneDrive Resources</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid: Player & Tabs on Left, Submission Box & AI Notes on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Video Player + Tabs) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Card */}
            <div className="bg-[#191c1d] rounded-3xl overflow-hidden shadow-xl text-white relative aspect-video flex flex-col justify-between p-4 md:p-6 group">
              {/* Overlay preview mockup */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0" />

              {/* Top info */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xs">
                    AS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Prof. Alexander Smith</h4>
                    <p className="text-[10px] text-white/70">Lecture 01 • Module Overview</p>
                  </div>
                </div>
                <span className="text-[10px] bg-red-600/80 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Recorded
                </span>
              </div>

              {/* Center Play Button */}
              <div className="relative z-10 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-[#012d1d]/80 hover:bg-[#012d1d] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  <Play className={`w-6 h-6 ml-0.5 ${isPlaying ? 'opacity-50' : ''}`} />
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="relative z-10 space-y-2">
                <div className="w-full bg-white/30 rounded-full h-1.5 cursor-pointer">
                  <div className="bg-[#ffb702] h-full rounded-full w-1/3" />
                </div>
                <div className="flex items-center justify-between text-xs text-white/90">
                  <div className="flex items-center gap-3">
                    <span>14:20 / 45:00</span>
                    <button className="hover:text-[#ffb702]">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono bg-white/10 px-1.5 py-0.5 rounded">1.0x</span>
                    <button className="hover:text-[#ffb702]">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tab Navigation */}
            <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow">
              {/* Tab Header */}
              <div className="flex items-center gap-2 border-b border-[#f3f4f5] pb-4 mb-6 text-sm font-semibold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'overview'
                      ? 'bg-[#012d1d] text-white shadow-xs'
                      : 'text-[#717973] hover:text-[#191c1d]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'review'
                      ? 'bg-[#012d1d] text-white shadow-xs'
                      : 'text-[#717973] hover:text-[#191c1d]'
                  }`}
                >
                  Reviews (128)
                </button>
                <button
                  onClick={() => setActiveTab('instructor')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'instructor'
                      ? 'bg-[#012d1d] text-white shadow-xs'
                      : 'text-[#717973] hover:text-[#191c1d]'
                  }`}
                >
                  Instructor
                </button>
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'faq'
                      ? 'bg-[#012d1d] text-white shadow-xs'
                      : 'text-[#717973] hover:text-[#191c1d]'
                  }`}
                >
                  FAQ
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs md:text-sm text-[#414844] leading-relaxed">
                  <h4 className="font-bold text-base text-[#191c1d]">
                    Course & Assignment Objectives
                  </h4>
                  <p>
                    In this module, you and your group will implement fundamental algorithms and frontend data flows. Ensure all unit tests pass before submitting.
                  </p>
                  <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-[#e1e3e4] space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#191c1d]">
                      Submission Checklist:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-[#717973]">
                      <li>Upload final repo or assets link to the shared OneDrive workspace.</li>
                      <li>Ensure all team members have completed their assigned code reviews.</li>
                      <li>Click the <strong>Confirm Submission</strong> button below to finalize.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-2xl">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-[#191c1d]">4.9</span>
                      <div className="flex text-[#ffb702] mt-1 justify-center">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                    <p className="text-xs text-[#717973]">
                      Based on 128 student ratings across the department.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 border border-[#e1e3e4] rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-[#191c1d]">
                        <span>Divya Sharma</span>
                        <span className="text-[#717973] font-normal">2 days ago</span>
                      </div>
                      <p className="text-[#414844]">
                        Great walkthrough on event delegation and DOM bubbling!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'instructor' && (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#012d1d] text-white font-bold flex items-center justify-center text-lg">
                    AS
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#191c1d]">Prof. Alexander Smith</h4>
                    <p className="text-xs text-[#717973]">Lead Instructor • Computer Science</p>
                    <p className="text-xs text-[#414844] mt-2 leading-relaxed">
                      Professor of Software Engineering specializing in distributed web applications and modern JavaScript runtimes.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#f8f9fa] rounded-xl">
                    <p className="font-bold text-[#191c1d]">Can any group member submit?</p>
                    <p className="text-[#717973] mt-1">
                      Yes! Any member of the group can perform the final submission confirmation for the whole group.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f8f9fa] rounded-xl">
                    <p className="font-bold text-[#191c1d]">How do I verify submission status?</p>
                    <p className="text-[#717973] mt-1">
                      The status badge will turn green immediately and reflect across all group member dashboards.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Submission Action Box, AI Assistant & AI Notes) */}
          <div className="space-y-6">
            {/* SUBMISSION CONFIRMATION BOX (§9 Requirement) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow">
              <h3 className="font-bold text-base text-[#191c1d] mb-1">Assignment Submission</h3>
              <p className="text-xs text-[#717973] mb-4">
                Confirm your group's completed coursework.
              </p>

              <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-[#e1e3e4] space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#717973]">Target Group:</span>
                  <span className="font-bold text-[#191c1d]">{assignment?.group_name || 'Cohort'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#717973]">Status:</span>
                  {isSubmitted ? (
                    <Badge variant="success" dot>
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="warning" dot>
                      Pending Confirmation
                    </Badge>
                  )}
                </div>
              </div>

              {isSubmitted ? (
                <div className="p-4 bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] mx-auto" />
                  <h4 className="font-bold text-xs text-[#2D6A4F]">
                    Submission Recorded
                  </h4>
                  <p className="text-[11px] text-[#414844]">
                    Your group submission has been saved and logged to the professor's gradebook.
                  </p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="w-full"
                  icon={Send}
                >
                  Confirm Submission
                </Button>
              )}
            </div>

            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-[#012d1d] to-[#1b4332] text-white rounded-3xl p-6 soft-shadow relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wide text-[#ffb702]">
                <Sparkles className="w-4 h-4" />
                <span>AI Lecture Assistant</span>
              </div>
              <p className="text-xs text-[#a5d0b9] leading-relaxed mb-4">
                Analyzing lecture transcript and starter code repo to highlight key concepts and potential bugs.
              </p>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-xs flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#ffb702] shrink-0" />
                <span className="truncate">Key insight: Avoid mutating state directly in async loops.</span>
              </div>
            </div>

            {/* AI Notes with Timestamps */}
            <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-[#191c1d]">AI Timed Notes</h3>
                <span className="text-[11px] bg-[#ebdcff] text-[#2e1b50] font-bold px-2 py-0.5 rounded-full">
                  4 bookmarks
                </span>
              </div>

              <div className="space-y-3">
                {notesList.map((note, index) => (
                  <div
                    key={index}
                    onClick={() => alert(`Seeking lecture playback to ${note.time}`)}
                    className="p-3 rounded-xl border border-[#e1e3e4] hover:border-[#012d1d]/40 transition-colors cursor-pointer group bg-[#f8f9fa]/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#012d1d] bg-[#012d1d]/10 px-2 py-0.5 rounded-md">
                        {note.time}
                      </span>
                      <span className="text-[10px] text-[#717973] font-medium">{note.tag}</span>
                    </div>
                    <p className="text-xs text-[#191c1d] group-hover:text-[#012d1d] transition-colors font-medium">
                      {note.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content Accordion */}
            <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow">
              <h3 className="font-bold text-base text-[#191c1d] mb-4">Course Content</h3>
              <div className="space-y-2 text-xs">
                {courseModules.map((mod) => (
                  <div
                    key={mod.id}
                    className={`p-3 rounded-xl flex items-center justify-between ${
                      mod.status === 'active'
                        ? 'bg-[#012d1d]/10 text-[#012d1d] font-bold'
                        : mod.status === 'completed'
                        ? 'bg-[#f8f9fa] text-[#414844]'
                        : 'bg-[#f8f9fa]/40 text-[#717973]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {mod.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                      ) : mod.status === 'active' ? (
                        <Play className="w-4 h-4 text-[#012d1d] fill-current" />
                      ) : (
                        <Lock className="w-4 h-4 text-[#717973]" />
                      )}
                      <span>{mod.title}</span>
                    </div>
                    <span className="text-[11px] opacity-75">{mod.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <SubmissionConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        assignment={assignment}
        groupId={assignment?.group_id || 1}
        groupName={assignment?.group_name || 'Alpha Cohort'}
        onSubmissionSuccess={handleSubmissionSuccess}
      />
    </DashboardLayout>
  );
}
