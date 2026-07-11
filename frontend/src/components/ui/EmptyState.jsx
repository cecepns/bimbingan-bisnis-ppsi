import { AlertTriangle } from 'lucide-react';

const EmptyState = ({ icon: Icon = AlertTriangle, title = 'No data found', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <Icon size={32} className="text-gray-400 dark:text-gray-600" />
    </div>
    <h3 className="text-gray-900 dark:text-gray-300 font-semibold text-lg mb-1">{title}</h3>
    {description && <p className="text-gray-500 text-sm mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
