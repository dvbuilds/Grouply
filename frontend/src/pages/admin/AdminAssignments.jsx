import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import CreateAssignmentModal from '../../components/assignments/CreateAssignmentModal.jsx';
import {
  getAllAssignmentsApi,
  deleteAssignmentApi,
} from '../../api/assignments.js';
import { getAllGroupsApi } from '../../api/groups.js';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckSquare,
  Clock,
  ExternalLink,
  Search,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export default function AdminAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assignList, groupList] = await Promise.all([
        getAllAssignmentsApi(),
        getAllGroupsApi(),
      ]);
      setAssignments(assignList || []);
      setGroups(groupList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAssignmentApi(assignmentToDelete.id);
      setAssignmentToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Assignment Management"
      subtitle="Create, configure, and monitor course assignments"
    >
      <div className="space-y-6 pb-12">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#e1e3e4] soft-shadow">
          <div>
            <h3 className="font-bold text-lg text-[#191c1d]">Course Assignments</h3>
            <p className="text-xs text-[#717973] mt-0.5">
              Deploy coursework, configure target group scopes, and track completions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#717973]" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#e1e3e4] focus:border-[#012d1d] outline-none"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setAssignmentToEdit(null);
                setIsCreateOpen(true);
              }}
              icon={Plus}
            >
              New Assignment
            </Button>
          </div>
        </div>

        {}
        <div className="bg-white rounded-3xl border border-[#e1e3e4] overflow-hidden soft-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e1e3e4] text-[11px] font-semibold text-[#717973] uppercase tracking-wider">
                  <th className="py-4 px-6">Assignment</th>
                  <th className="py-4 px-6">Scope</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Resources</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f5] text-xs">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#012d1d]/10 text-[#012d1d] flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#191c1d]">{assignment.title}</p>
                          <p className="text-[11px] text-[#717973] line-clamp-1 max-w-md mt-0.5">
                            {assignment.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={assignment.target_scope === 'all' ? 'primary' : 'neutral'}>
                        {assignment.target_scope === 'all' ? 'All Groups' : 'Specific Groups'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-[#717973]">
                      <div className="flex items-center gap-1.5 font-medium text-[#191c1d]">
                        <Clock className="w-3.5 h-3.5 text-[#FB8500]" />
                        <span>{formatDate(assignment.due_date)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {assignment.onedrive_link ? (
                        <a
                          href={assignment.onedrive_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#4361EE] hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>OneDrive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[#717973]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/submissions?assignmentId=${assignment.id}`)
                          }
                          icon={CheckSquare}
                        >
                          Submissions
                        </Button>
                        <button
                          onClick={() => {
                            setAssignmentToEdit(assignment);
                            setIsCreateOpen(true);
                          }}
                          className="p-2 text-[#717973] hover:text-[#012d1d] hover:bg-[#f3f4f5] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAssignmentToDelete(assignment)}
                          className="p-2 text-[#717973] hover:text-[#D90429] hover:bg-[#D90429]/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {}
      <CreateAssignmentModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setAssignmentToEdit(null);
        }}
        allGroups={groups}
        assignmentToEdit={assignmentToEdit}
        onSaved={() => fetchData()}
      />

      {}
      <ConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Assignment?"
        message={`Are you sure you want to delete "${assignmentToDelete?.title}"? All submissions associated with this assignment will also be removed.`}
        confirmText="Delete Assignment"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
