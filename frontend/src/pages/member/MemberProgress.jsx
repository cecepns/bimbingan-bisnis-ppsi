import { useEffect, useState } from 'react';
import { progressService } from '../../utils/request';
import { getProgressPercent, formatDurationDisplay } from '../../utils/helpers';
import { CheckCircle, Lock, PlayCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MemberProgress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await progressService.getMy();
        setData(res.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={32} className="animate-spin text-indigo-400" /></div>;
  }

  const { summary, progress } = data || {};
  const pct = getProgressPercent(summary?.completed, summary?.total_materials);

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={18} className="text-green-400" />;
    if (status === 'in_progress') return <PlayCircle size={18} className="text-yellow-400" />;
    if (status === 'available') return <PlayCircle size={18} className="text-blue-400" />;
    return <Lock size={18} className="text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Belajar</h1>
        <p className="text-gray-400 text-sm mt-1">Pantau kemajuan belajar Anda</p>
      </div>

      {/* Overall Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            <h2 className="text-gray-900 dark:text-white font-semibold">Progress Keseluruhan</h2>
          </div>
          <span className="text-3xl font-bold text-indigo-400">{pct}%</span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-800 rounded-full h-5 overflow-hidden mb-4">
          <div className="progress-bar h-5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: summary?.total_materials || 0, color: 'text-gray-900 dark:text-white' },
            { label: 'Selesai', value: summary?.completed || 0, color: 'text-green-400' },
            { label: 'Dipelajari', value: summary?.in_progress || 0, color: 'text-yellow-400' },
            { label: 'Terkunci', value: summary?.locked || 0, color: 'text-gray-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Progress List */}
      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-gray-900 dark:text-white font-semibold">Detail Per Materi</h2>
        </div>
        <div className="divide-y divide-white/5">
          {progress?.map((item) => (
            <div key={item.id} className={`flex items-center gap-4 p-4 transition-colors ${item.status !== 'locked' ? 'hover:bg-white/3' : ''}`}>
              <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>
              <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                {item.order_index}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={item.status !== 'locked' ? `/member/materials/${item.id}` : '#'}
                  className={`text-sm font-medium ${item.status !== 'locked' ? 'text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors' : 'text-gray-500'}`}
                >
                  {item.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={10} /> {formatDurationDisplay(item.duration_seconds, item.duration_minutes)}</span>
                  {item.time_spent > 0 && (
                    <span>Waktu belajar: {Math.floor(item.time_spent / 60)}m {item.time_spent % 60}s</span>
                  )}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                item.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                item.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                item.status === 'available' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                'bg-gray-700/50 text-gray-500 border-gray-600'
              }`}>
                {item.status === 'completed' ? 'Selesai' :
                 item.status === 'in_progress' ? 'Dipelajari' :
                 item.status === 'available' ? 'Tersedia' : 'Terkunci'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberProgress;
