import api from './api';

const getStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data.data;
};

export default { getStats };
