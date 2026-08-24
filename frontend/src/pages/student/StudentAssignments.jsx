import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import { getMyAssignmentsApi } from '../../api/assignments.js';
import {
  FileText,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function StudentAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'submitted'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await getMyAssignmentsApi();
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === 'pending') {
      return matchesSearch && !item.is_submitted;
    }
    if (filterStatus === 'submitted') {
      return matchesSearch && item.is_submitted;
    }
    return matchesSearch;
  });

  return (
    <DashboardLayout
      title="Assignments & Coursework"
      subtitle="Track deadlines, resources, and team submissions"
    >
      <div className="space-y-6 pb-12">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 md:p-6 border border-[#e1e3e4] soft-shadow">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#f3f4f5] p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-[#012d1d] shadow-xs'
                  : 'text-[#717973] hover:text-[#191c1d]'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-white text-[#012d1d] shadow-xs'
                  : 'text-[#717973] hover:text-[#191c1d]'
              }`}
            >
              Pending ({assignments.filter((a) => !a.is_submitted).length})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'submitted'
                  ? 'bg-white text-[#012d1d] shadow-xs'
                  : 'text-[#717973] hover:text-[#191c1d]'
              }`}
            >
              Completed ({assignments.filter((a) => a.is_submitted).length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#e1e3e4] focus:border-[#012d1d] focus:ring-2 focus:ring-[#012d1d]/10 outline-none"
            />
          </div>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#e1e3e4] max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#012d1d]/10 text-[#012d1d] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#191c1d] mb-1">No assignments found</h3>
            <p className="text-xs text-[#717973]">
              {filterStatus === 'all'
                ? 'No coursework assigned to your groups currently.'
                : `No ${filterStatus} assignments found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => {
              const isSubmitted = assignment.is_submitted;

              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-3xl p-6 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Group Tag & Status */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-bold text-[#012d1d] bg-[#012d1d]/10 px-2.5 py-1 rounded-full">
                        {assignment.group_name || 'Assigned Group'}
                      </span>

                      {isSubmitted ? (
                        <Badge variant="success" dot>
                          Submitted
                        </Badge>
                      ) : (
                        <Badge variant="warning" dot>
                          Pending
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-[#191c1d] mb-2 line-clamp-1">
                      {assignment.title}
                    </h4>
                    <p className="text-xs text-[#414844] mb-4 line-clamp-2 leading-relaxed">
                      {assignment.description || 'Complete the exercises and confirm submission with your team.'}
                    </p>

                    <div className="bg-[#f8f9fa] rounded-2xl p-3.5 border border-[#e1e3e4]/60 space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#717973] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Due Date
                        </span>
                        <span className="font-semibold text-[#191c1d]">
                          {formatDate(assignment.due_date)}
                        </span>
                      </div>

                      {assignment.onedrive_link && (
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-[#e1e3e4]/40">
                          <span className="text-[#717973]">Starter Files</span>
                          <a
                            href={assignment.onedrive_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#4361EE] hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>OneDrive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f3f4f5]">
                    <Button
                      variant={isSubmitted ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => navigate(`/student/assignments/${assignment.id}`)}
                      className="w-full flex items-center justify-between"
                    >
                      <span>{isSubmitted ? 'View Submission' : 'Review & Submit'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
