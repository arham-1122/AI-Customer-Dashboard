import api from './api';

const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data.data;
};

const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
};

const getProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data.data;
};

export default { register, login, getProfile };
