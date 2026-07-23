import api from './api';

const getCustomers = async (params) => {
  const { data } = await api.get('/customers', { params });
  return data; // { success, data, pagination }
};

const getCustomerById = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data.data;
};

const createCustomer = async (payload) => {
  const { data } = await api.post('/customers', payload);
  return data.data;
};

const updateCustomer = async (id, payload) => {
  const { data } = await api.put(`/customers/${id}`, payload);
  return data.data;
};

const deleteCustomer = async (id) => {
  const { data } = await api.delete(`/customers/${id}`);
  return data;
};

const addNote = async (id, text) => {
  const { data } = await api.post(`/customers/${id}/notes`, { text });
  return data.data;
};

export default { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, addNote };
