import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/Skeletons';
import importExportService from '../services/importExportService';
import { useToast } from '../context/ToastContext';

const ImportHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    importExportService
      .getImportHistory()
      .then(setHistory)
      .catch((err) => showToast(err.response?.data?.message || 'Failed to load import history', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          A record of every Excel/CSV import into the system.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card overflow-x-auto">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            title="No imports yet"
            subtitle="Once you import customers from an Excel or CSV file, the history will show up here."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 font-medium">File Name</th>
                <th className="px-4 py-3 font-medium">Imported By</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Imported</th>
                <th className="px-4 py-3 font-medium text-right">Failed</th>
                <th className="px-4 py-3 font-medium text-right">Duplicates</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h._id} className="border-b border-gray-100 dark:border-gray-800/60">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{h.fileName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{h.importedBy?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(h.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">{h.totalRecords}</td>
                  <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-medium">
                    {h.successfulRecords}
                  </td>
                  <td className="px-4 py-3 text-right text-red-500">{h.failedRecords}</td>
                  <td className="px-4 py-3 text-right text-amber-500">{h.duplicateRecords}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ImportHistory;
