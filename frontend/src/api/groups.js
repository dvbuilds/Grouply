import api from './axios.js';

// Get groups for logged in student
export const getMyGroupsApi = async () => {
  const response = await api.get('/groups/mine');
  return response.data;
};

// Get all groups (Admin)
export const getAllGroupsApi = async () => {
  const response = await api.get('/groups');
  return response.data;
};

// Create a group (Student)
export const createGroupApi = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

// Get group members
export const getGroupMembersApi = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

// Add a member by email or student ID (Student leader)
export const addGroupMemberApi = async (groupId, memberIdentifier) => {
  const response = await api.post(`/groups/${groupId}/members`, memberIdentifier);
  return response.data;
};

// Remove a member (Student leader)
export const removeGroupMemberApi = async (groupId, userId) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

// Leave group (Student member)
export const leaveGroupApi = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/leave`);
  return response.data;
};

// Delete group (Student leader)
export const deleteGroupApi = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}`);
  return response.data;
};
