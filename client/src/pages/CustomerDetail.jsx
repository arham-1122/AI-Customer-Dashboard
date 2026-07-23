import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import SentimentBadge from '../components/SentimentBadge';
import Modal from '../components/Modal';
import customerService from '../services/customerService';
import aiService from '../services/aiService';
import { useToast } from '../context/ToastContext';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Independent loading state per AI feature so buttons don't block each other
  const [aiLoading, setAiLoading] = useState({ summary: false, followUp: false, sentiment: false });

  const loadCustomer = () => {
    customerService
      .getCustomerById(id)
      .then(setCustomer)
      .catch((err) => showToast(err.response?.data?.message || 'Failed to load customer', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const updated = await customerService.addNote(id, newNote.trim());
      setCustomer(updated);
      setNewNote('');
      showToast('Note added', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add note', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerService.deleteCustomer(id);
      showToast('Customer deleted', 'success');
      navigate('/customers');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete customer', 'error');
      setDeleting(false);
    }
  };

  const runAi = async (type) => {
    setAiLoading((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === 'summary') {
        const { summary } = await aiService.summarizeNotes(id);
        setCustomer((c) => ({ ...c, aiSummary: summary }));
      } else if (type === 'followUp') {
        const { followUp } = await aiService.suggestFollowUp(id);
        setCustomer((c) => ({ ...c, aiFollowUp: followUp }));
      } else if (type === 'sentiment') {
        const sentiment = await aiService.analyzeSentiment(id);
        setCustomer((c) => ({ ...c, aiSentiment: sentiment }));
      }
      showToast('AI insight generated', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'AI request failed', 'error');
    } finally {
      setAiLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) return null;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.fullName}</h1>
            <StatusBadge status={customer.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{customer.company}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/customers/${id}/edit`}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Edit Customer
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: customer info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{customer.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{customer.phone}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Company Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Company</dt>
                <dd className="text-gray-900 dark:text-white font-medium">{customer.company}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                <dd><StatusBadge status={customer.status} /></dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Record Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {new Date(customer.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right column: notes + AI insights */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Insights Panel */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => runAi('summary')}
                disabled={aiLoading.summary}
                className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 text-xs font-medium disabled:opacity-60"
              >
                {aiLoading.summary ? 'Summarizing...' : 'Generate AI Summary'}
              </button>
              <button
                onClick={() => runAi('followUp')}
                disabled={aiLoading.followUp}
                className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 text-xs font-medium disabled:opacity-60"
              >
                {aiLoading.followUp ? 'Thinking...' : 'Suggest Next Action'}
              </button>
              <button
                onClick={() => runAi('sentiment')}
                disabled={aiLoading.sentiment}
                className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 text-xs font-medium disabled:opacity-60"
              >
                {aiLoading.sentiment ? 'Analyzing...' : 'Analyze Sentiment'}
              </button>
            </div>

            <div className="space-y-3">
              {customer.aiSummary && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    Summary
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{customer.aiSummary}</p>
                </div>
              )}
              {customer.aiFollowUp && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    Recommended Follow-Up
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{customer.aiFollowUp}</p>
                </div>
              )}
              {customer.aiSentiment?.label && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Sentiment
                  </p>
                  <SentimentBadge label={customer.aiSentiment.label} confidence={customer.aiSentiment.confidence} />
                </div>
              )}
              {!customer.aiSummary && !customer.aiFollowUp && !customer.aiSentiment?.label && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No AI insights generated yet. Use the buttons above to analyze this customer's notes.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Notes</h3>

            <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this customer..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                type="submit"
                disabled={addingNote}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium"
              >
                {addingNote ? 'Adding...' : 'Add'}
              </button>
            </form>

            {customer.notes?.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {[...customer.notes].reverse().map((note) => (
                  <div key={note._id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{note.text}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete customer"
        footer={
          <>
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        Are you sure you want to delete <strong>{customer.fullName}</strong>? This action cannot be undone.
      </Modal>
    </DashboardLayout>
  );
};

export default CustomerDetail;
