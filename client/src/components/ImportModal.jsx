import { useRef, useState } from 'react';
import Modal from './Modal';
import importExportService from '../services/importExportService';
import { useToast } from '../context/ToastContext';

const STAGE = {
  UPLOAD: 'upload',
  PREVIEW: 'preview',
  IMPORTING: 'importing',
  SUCCESS: 'success',
};

const ImportModal = ({ open, onClose, onImported }) => {
  const [stage, setStage] = useState(STAGE.UPLOAD);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(null); // { fileName, rows, summary }
  const [finalSummary, setFinalSummary] = useState(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const reset = () => {
    setStage(STAGE.UPLOAD);
    setUploadProgress(0);
    setPreview(null);
    setFinalSummary(null);
    setDragOver(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file) => {
    if (!file) return;
    const validExt = /\.(xlsx|xls|csv)$/i.test(file.name);
    if (!validExt) {
      showToast('Unsupported file type. Please upload .xlsx, .xls, or .csv', 'error');
      return;
    }

    setUploadProgress(0);
    try {
      const data = await importExportService.previewImport(file, setUploadProgress);
      setPreview(data);
      setStage(STAGE.PREVIEW);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to parse file', 'error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    setStage(STAGE.IMPORTING);
    try {
      const validRows = preview.rows.filter((r) => r.valid);
      const result = await importExportService.commitImport(preview.fileName, validRows);
      setFinalSummary(result.summary);
      setStage(STAGE.SUCCESS);
      onImported?.();
    } catch (err) {
      showToast(err.response?.data?.message || 'Import failed', 'error');
      setStage(STAGE.PREVIEW);
    }
  };

  const invalidRows = preview?.rows.filter((r) => !r.valid) || [];

  return (
    <Modal open={open} onClose={handleClose} title="Import Customers" size="xl">
      {stage === STAGE.UPLOAD && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-brand-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Supports .xlsx, .xls, and .csv (max 5MB)</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Expected columns: Full Name, Email, Phone, Company, Status, Notes
          </p>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {stage === STAGE.PREVIEW && preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <SummaryPill label="Total Records" value={preview.summary.totalRecords} color="brand" />
            <SummaryPill label="Valid" value={preview.summary.validRecords} color="green" />
            <SummaryPill label="Failed" value={preview.summary.failedRecords} color="red" />
            <SummaryPill label="Duplicates" value={preview.summary.duplicateRecords} color="amber" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Preview</h4>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-auto max-h-64">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Full Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={row.rowNumber} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.rowNumber}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.data.fullName}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.data.email}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.data.company}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{row.data.status}</td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Valid</span>
                        ) : row.isDuplicate ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">Duplicate</span>
                        ) : (
                          <span className="text-red-500 font-medium">Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {invalidRows.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Validation Errors</h4>
              <div className="border border-red-200 dark:border-red-900/50 rounded-lg overflow-auto max-h-40 bg-red-50/50 dark:bg-red-900/10">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400">
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invalidRows.map((row) => (
                      <tr key={row.rowNumber} className="border-t border-red-100 dark:border-red-900/30">
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{row.rowNumber}</td>
                        <td className="px-3 py-2 text-red-600 dark:text-red-400">
                          {row.isDuplicate ? 'Duplicate email' : row.errors.join('; ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
            >
              Choose Different File
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={preview.summary.validRecords === 0}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium"
            >
              Import {preview.summary.validRecords} Valid Record{preview.summary.validRecords === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      )}

      {stage === STAGE.IMPORTING && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-300">Importing records into your database...</p>
        </div>
      )}

      {stage === STAGE.SUCCESS && finalSummary && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Import Complete</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Your customers have been imported and the dashboard has been updated.
          </p>
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
            <SummaryPill label="Total" value={finalSummary.totalRecords} color="brand" />
            <SummaryPill label="Imported" value={finalSummary.successfulRecords} color="green" />
            <SummaryPill label="Failed" value={finalSummary.failedRecords} color="red" />
            <SummaryPill label="Duplicates" value={finalSummary.duplicateRecords} color="amber" />
          </div>
          <button
            onClick={handleClose}
            className="mt-6 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
};

const pillColors = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  green: 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-200',
  red: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
};

const SummaryPill = ({ label, value, color }) => (
  <div className={`rounded-lg p-3 text-center ${pillColors[color]}`}>
    <p className="text-lg font-bold">{value}</p>
    <p className="text-[11px] font-medium opacity-80">{label}</p>
  </div>
);

export default ImportModal;
