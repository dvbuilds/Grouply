import api from './axios.js';

// Get admin dashboard analytics overview
export const getOverviewAnalyticsApi = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};
