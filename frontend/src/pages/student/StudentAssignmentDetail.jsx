import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import SubmissionConfirmModal from '../../components/assignments/SubmissionConfirmModal.jsx';
import { getMyAssignmentsApi } from '../../api/assignments.js';
import { attachSubmissionStatus } from '../../utils/assignmentStatus.js';
import {
  ChevronLeft,
  Clock,
  ExternalLink,
  CheckCircle2,
  FileText,
  Send,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignmentData = async () => {
    try {
      setIsLoading(true);
      const list = await getMyAssignmentsApi();
      const withStatus = await attachSubmissionStatus(list || []);
      const item = withStatus.find((a) => String(a.id) === String(id));
      if (item) {
        setAssignment(item);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
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

  if (!isLoading && notFound) {
    return (
      <DashboardLayout title="Assignment Details" subtitle="Coursework">
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e1e3e4] max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#012d1d]/10 text-[#012d1d] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[#191c1d] mb-1">Assignment not found</h3>
          <p className="text-xs text-[#717973] mb-4">
            This assignment doesn't exist or isn't assigned to any of your groups.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/student/assignments')}>
            Back to Assignments
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={assignment?.title || 'Assignment Details'}
      subtitle="Coursework Details"
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

        {/* Main Grid: Details on Left, Submission Box on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow space-y-4 text-xs md:text-sm text-[#414844] leading-relaxed">
              <h4 className="font-bold text-base text-[#191c1d]">Assignment Overview</h4>
              <p>
                Complete the coursework described above with your group, then confirm the
                submission once it's ready.
              </p>
              <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-[#e1e3e4] space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#191c1d]">
                  Submission Checklist:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#717973]">
                  <li>Upload your final work to the shared OneDrive workspace.</li>
                  <li>Coordinate with your group members before finalizing.</li>
                  <li>
                    Any member of the group can click <strong>Confirm Submission</strong> to
                    finalize on behalf of the group.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Submission Action Box */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] soft-shadow">
              <h3 className="font-bold text-base text-[#191c1d] mb-1">Assignment Submission</h3>
              <p className="text-xs text-[#717973] mb-4">
                Confirm your group's completed coursework.
              </p>

              <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-[#e1e3e4] space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#717973]">Target Group:</span>
                  <span className="font-bold text-[#191c1d]">
                    {assignment?.group_name || 'Not applicable'}
                  </span>
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
                  <h4 className="font-bold text-xs text-[#2D6A4F]">Submission Recorded</h4>
                  <p className="text-[11px] text-[#414844]">
                    Your group's submission has been confirmed.
                  </p>
                </div>
              ) : assignment?.group_id ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="w-full"
                  icon={Send}
                >
                  Confirm Submission
                </Button>
              ) : (
                <p className="text-[11px] text-[#717973] text-center py-2">
                  You aren't in a group targeted by this assignment yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {assignment?.group_id && (
        <SubmissionConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          assignment={assignment}
          groupId={assignment.group_id}
          groupName={assignment.group_name}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </DashboardLayout>
  );
}
