import api from './api';

const summarizeNotes = async (customerId) => {
  const { data } = await api.post(`/ai/summarize/${customerId}`);
  return data.data;
};

const suggestFollowUp = async (customerId) => {
  const { data } = await api.post(`/ai/follow-up/${customerId}`);
  return data.data;
};

const analyzeSentiment = async (customerId) => {
  const { data } = await api.post(`/ai/sentiment/${customerId}`);
  return data.data;
};

export default { summarizeNotes, suggestFollowUp, analyzeSentiment };
