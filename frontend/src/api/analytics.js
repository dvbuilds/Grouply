import api from './axios.js';

export const getOverviewAnalyticsApi = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};
