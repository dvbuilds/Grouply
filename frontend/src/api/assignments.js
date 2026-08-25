import api from './axios.js';

export const getMyAssignmentsApi = async () => {
  const response = await api.get('/assignments/mine');
  return response.data;
};

export const getAllAssignmentsApi = async () => {
  const response = await api.get('/assignments');
  return response.data;
};

export const createAssignmentApi = async (assignmentData) => {
  const response = await api.post('/assignments', assignmentData);
  return response.data;
};

export const updateAssignmentApi = async (id, assignmentData) => {
  const response = await api.put(`/assignments/${id}`, assignmentData);
  return response.data;
};

export const deleteAssignmentApi = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};
