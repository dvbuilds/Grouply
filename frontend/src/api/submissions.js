import api from './axios.js';

// Final Confirm Submission (Student member)
export const confirmSubmissionApi = async (assignmentId, groupId) => {
  const response = await api.post(`/submissions/${assignmentId}/groups/${groupId}/confirm`);
  return response.data;
};

// Get a group's submission progress (Any)
export const getGroupProgressApi = async (groupId) => {
  const response = await api.get(`/submissions/groups/${groupId}/progress`);
  return response.data;
};

// Get per-group status for one assignment (Admin)
export const getAssignmentSubmissionsApi = async (assignmentId) => {
  const response = await api.get(`/submissions/${assignmentId}`);
  return response.data;
};

// Get student-wise submission status for one assignment (Admin)
export const getAssignmentStudentSubmissionsApi = async (assignmentId) => {
  const response = await api.get(`/submissions/${assignmentId}/students`);
  return response.data;
};
