import api from './axios.js';

export const confirmSubmissionApi = async (assignmentId, groupId) => {
  const response = await api.post(`/submissions/${assignmentId}/groups/${groupId}/confirm`);
  return response.data;
};

export const getGroupProgressApi = async (groupId) => {
  const response = await api.get(`/submissions/groups/${groupId}/progress`);
  return response.data;
};

export const getAssignmentSubmissionsApi = async (assignmentId) => {
  const response = await api.get(`/submissions/${assignmentId}`);
  return response.data;
};

export const getAssignmentStudentSubmissionsApi = async (assignmentId) => {
  const response = await api.get(`/submissions/${assignmentId}/students`);
  return response.data;
};
