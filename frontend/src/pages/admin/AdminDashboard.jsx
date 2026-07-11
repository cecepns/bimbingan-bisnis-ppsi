import { useEffect, useState } from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp, Eye, FileText, Loader2, BarChart2 } from 'lucide-react';
import { statsService } from '../../utils/request';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { getProgressPercent } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="card hover:border-white/20 transition-all duration-200 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsService.getDashboard();
        setStats(res.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Array(6).fill(0).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Member', value: stats?.totalMembers || 0, color: 'bg-indigo-600', subtext: `${stats?.activeMembers || 0} aktif` },
    { icon: BookOpen, label: 'Total Materi', value: stats?.totalMaterials || 0, color: 'bg-purple-600', subtext: `${stats?.publishedMaterials || 0} publish` },
    { icon: FileText, label: 'Draft Materi', value: stats?.draftMaterials || 0, color: 'bg-yellow-600', subtext: 'Belum dipublish' },
    { icon: CheckCircle, label: 'Total Penyelesaian', value: stats?.totalCompleted || 0, color: 'bg-green-600', subtext: 'Materi diselesaikan' },
    { icon: TrendingUp, label: 'Sedang Dipelajari', value: stats?.totalInProgress || 0, color: 'bg-blue-600', subtext: 'Progress aktif' },
    { icon: Eye, label: 'Member Aktif', value: stats?.activeMembers || 0, color: 'bg-pink-600', subtext: 'Akun tidak dinonaktifkan' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Ringkasan statistik aplikasi LMS Bisnis</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Materials */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} className="text-indigo-400" />
            <h2 className="text-gray-900 dark:text-white font-semibold">Materi Terpopuler</h2>
          </div>
          <div className="space-y-3">
            {stats?.topMaterials?.length > 0 ? stats.topMaterials.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-6 text-right">{m.order_index}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${m.starts ? Math.min(100, (m.completions / m.starts) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {m.completions} selesai
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{m.view_count} views</span>
              </div>
            )) : (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada data</p>
            )}
          </div>
        </div>

        {/* Member Progress */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-400" />
            <h2 className="text-gray-900 dark:text-white font-semibold">Progress Member Teratas</h2>
          </div>
          <div className="space-y-3">
            {stats?.memberProgress?.length > 0 ? stats.memberProgress.map((m) => {
              const pct = getProgressPercent(m.completed, m.total);
              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {m.name[0]}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-indigo-400">{pct}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 ml-9">
                    <div className="progress-bar h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada member</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
