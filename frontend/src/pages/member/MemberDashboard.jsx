import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Lock, PlayCircle, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import { progressService } from '../../utils/request';
import { useAuth } from '../../contexts/AuthContext';
import { getProgressPercent } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { user } = useAuth();
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
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  const { summary, continueMaterial } = data || {};
  const pct = getProgressPercent(summary?.completed, summary?.total_materials);

  const stats = [
    { label: 'Total Materi', value: summary?.total_materials || 0, icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
    { label: 'Selesai', value: summary?.completed || 0, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/10' },
    { label: 'Terkunci', value: summary?.locked || 0, icon: Lock, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-200 dark:bg-gray-700/50' },
    { label: 'Sedang Dipelajari', value: (summary?.in_progress || 0) + (summary?.available || 0), icon: PlayCircle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent border border-indigo-500/20 p-8">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-indigo-600 dark:text-indigo-300 font-medium mb-1">Selamat datang kembali 👋</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">Yuk lanjutkan perjalanan belajar Anda!</p>
          {continueMaterial && (
            <Link
              to={`/member/materials/${continueMaterial.id}`}
              className="inline-flex items-center gap-2 mt-4 btn-primary"
            >
              <PlayCircle size={18} />
              Lanjutkan Belajar
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card hover:border-white/20 transition-all duration-200">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-gray-900 dark:text-white font-semibold">Progress Belajar</h2>
          </div>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
          <div
            className="progress-bar h-4 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
          {summary?.completed || 0} dari {summary?.total_materials || 0} materi telah diselesaikan
        </p>
      </div>

      {/* Recent Progress */}
      {data?.progress?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 dark:text-white font-semibold">Progress Terbaru</h2>
            <Link to="/member/materials" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm transition-colors flex items-center gap-1">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.progress.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to={`/member/materials/${item.id}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:border-indigo-500/30 ${
                  item.status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
                  item.status === 'in_progress' ? 'bg-yellow-500/5 border-yellow-500/20' :
                  item.status === 'available' ? 'bg-blue-500/5 border-blue-500/20' :
                  'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-white/5 pointer-events-none'
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {item.order_index}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.duration_minutes} menit</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  item.status === 'completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' :
                  item.status === 'in_progress' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30' :
                  item.status === 'available' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' :
                  'bg-gray-200 dark:bg-gray-700/50 text-gray-500 border-gray-300 dark:border-gray-600'
                }`}>
                  {item.status === 'completed' ? '✓ Selesai' :
                   item.status === 'in_progress' ? '▶ Dipelajari' :
                   item.status === 'available' ? '○ Tersedia' : '🔒 Terkunci'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
