const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full ${sizeClasses[size] || sizeClasses.md} border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col`}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
