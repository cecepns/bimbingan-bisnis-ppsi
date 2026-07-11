const Badge = ({ status, children, className = '' }) => {
  const classes = {
    locked: 'bg-gray-700/50 text-gray-400 border-gray-600',
    available: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    publish: 'bg-green-500/20 text-green-400 border-green-500/30',
    draft: 'bg-gray-700/50 text-gray-400 border-gray-600',
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    member: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${classes[status] || 'bg-gray-700/50 text-gray-400 border-gray-600'} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
