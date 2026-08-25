import api from './axios.js';

export const getMyGroupsApi = async () => {
  const response = await api.get('/groups/mine');
  return response.data;
};

export const getAllGroupsApi = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const createGroupApi = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

export const getGroupMembersApi = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

export const addGroupMemberApi = async (groupId, memberIdentifier) => {
  const response = await api.post(`/groups/${groupId}/members`, memberIdentifier);
  return response.data;
};

export const removeGroupMemberApi = async (groupId, userId) => {
  const response = await api.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

export const leaveGroupApi = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/leave`);
  return response.data;
};

export const deleteGroupApi = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}`);
  return response.data;
};
