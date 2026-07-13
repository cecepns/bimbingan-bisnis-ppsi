const Badge = ({ status, children, className = '' }) => {
  const classes = {
    locked: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    available: 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    in_progress: 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
    completed: 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30',
    publish: 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30',
    draft: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    admin: 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
    member: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
    active: 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30',
    inactive: 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${classes[status] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
