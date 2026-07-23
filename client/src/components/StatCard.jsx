const colorMap = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  green: 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-200',
  red: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
};

const StatCard = ({ title, value, icon, color = 'brand', trend }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
