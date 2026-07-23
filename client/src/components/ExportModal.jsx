import { useState } from 'react';
import Modal from './Modal';
import importExportService from '../services/importExportService';
import { useToast } from '../context/ToastContext';

const ExportModal = ({ open, onClose, currentSearch }) => {
  const [option, setOption] = useState('all');
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const options = [
    { value: 'all', label: 'Export All Customers' },
    { value: 'active', label: 'Export Active Customers' },
    { value: 'inactive', label: 'Export Inactive Customers' },
    ...(currentSearch ? [{ value: 'search', label: `Export Current Search Results ("${currentSearch}")` }] : []),
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (option === 'active') params.status = 'Active';
      if (option === 'inactive') params.status = 'Inactive';
      if (option === 'search') params.search = currentSearch;

      await importExportService.exportCustomers(params);
      showToast('Export started — check your downloads', 'success');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Customers"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium"
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Choose which customers to include in the exported .xlsx file.
      </p>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer text-sm ${
              option === opt.value
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-200'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            <input
              type="radio"
              name="exportOption"
              value={opt.value}
              checked={option === opt.value}
              onChange={() => setOption(opt.value)}
              className="accent-brand-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </Modal>
  );
};

export default ExportModal;
