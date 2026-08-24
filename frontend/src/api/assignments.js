import api from './axios.js';

// Get assignments for logged in student
export const getMyAssignmentsApi = async () => {
  const response = await api.get('/assignments/mine');
  return response.data;
};

// Get all assignments (Admin)
export const getAllAssignmentsApi = async () => {
  const response = await api.get('/assignments');
  return response.data;
};

// Create assignment (Admin)
export const createAssignmentApi = async (assignmentData) => {
  const response = await api.post('/assignments', assignmentData);
  return response.data;
};

// Edit assignment (Admin)
export const updateAssignmentApi = async (id, assignmentData) => {
  const response = await api.put(`/assignments/${id}`, assignmentData);
  return response.data;
};

// Delete assignment (Admin)
export const deleteAssignmentApi = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};
