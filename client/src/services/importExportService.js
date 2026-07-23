import api from './api';

// Uploads the file for parsing + validation only — no DB writes yet.
const previewImport = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/customers/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
  return data.data; // { fileName, rows, summary }
};

// Commits the valid rows from a previewed import: bulk insert + history log.
const commitImport = async (fileName, rows) => {
  const { data } = await api.post('/customers/import', { fileName, rows });
  return data.data; // { summary, historyId }
};

// Triggers a browser download of an .xlsx file for the given filter set.
const exportCustomers = async (params) => {
  const response = await api.get('/customers/export', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'customers.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getImportHistory = async () => {
  const { data } = await api.get('/import-history');
  return data.data;
};

export default { previewImport, commitImport, exportCustomers, getImportHistory };
