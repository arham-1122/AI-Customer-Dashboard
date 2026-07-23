const styles = {
  Positive: 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Neutral: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Negative: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const SentimentBadge = ({ label, confidence }) => {
  if (!label) return null;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${styles[label] || styles.Neutral}`}>
      <span>{label}</span>
      {typeof confidence === 'number' && (
        <span className="text-xs opacity-75">{confidence}% confidence</span>
      )}
    </div>
  );
};

export default SentimentBadge;
