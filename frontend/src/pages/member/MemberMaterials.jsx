import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Lock, CheckCircle, PlayCircle, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { materialsService } from '../../utils/request';
import EmptyState from '../../components/ui/EmptyState';
import { getImageUrl, debounce } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { CardSkeleton } from '../../components/ui/Skeleton';

const StatusIcon = ({ status }) => {
  if (status === 'completed') return <CheckCircle size={18} className="text-green-400" />;
  if (status === 'in_progress') return <PlayCircle size={18} className="text-yellow-400" />;
  if (status === 'available') return <PlayCircle size={18} className="text-blue-400" />;
  return <Lock size={18} className="text-gray-500" />;
};

const MemberMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMaterials = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const p = reset ? 1 : page;
      const res = await materialsService.getAll({ page: p, limit: 12, search });
      setMaterials(prev => reset ? res.data : [...prev, ...res.data]);
      setHasMore(p < res.pagination.totalPages);
      if (!reset) setPage(p + 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    setPage(1);
    fetchMaterials(true);
  }, [search]);

  const debouncedSearch = useCallback(
    debounce((val) => setSearch(val), 300), []
  );

  const getStatusBanner = (status) => {
    if (status === 'completed') return 'border-green-500/40 shadow-green-500/10 shadow-lg';
    if (status === 'in_progress') return 'border-yellow-500/40 shadow-yellow-500/10 shadow-lg';
    if (status === 'available') return 'border-blue-500/40';
    return 'border-white/5 opacity-70';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semua Materi</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Pelajari materi secara berurutan</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="Cari materi..."
          className="input-field pl-10"
          onChange={(e) => debouncedSearch(e.target.value)} />
      </div>

      {/* Materials Grid */}
      {loading && materials.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : materials.length === 0 ? (
        <EmptyState icon={BookOpen} title="Materi tidak ditemukan" description="Coba kata kunci lain" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map((mat) => {
              const isLocked = mat.progress_status === 'locked' || !mat.progress_status;
              return (
                <Link
                  key={mat.id}
                  to={isLocked ? '#' : `/member/materials/${mat.id}`}
                  onClick={isLocked ? (e) => { e.preventDefault(); toast.error('Selesaikan materi sebelumnya terlebih dahulu'); } : undefined}
                  className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 ${getStatusBanner(mat.progress_status)} ${!isLocked ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-800">
                    {mat.thumbnail ? (
                      <img src={getImageUrl(`thumbnails/${mat.thumbnail}`)} alt={mat.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                        <BookOpen size={40} className="text-indigo-400/60" />
                      </div>
                    )}

                    {/* Lock overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-900/80 flex items-center justify-center">
                          <Lock size={22} className="text-gray-400" />
                        </div>
                      </div>
                    )}

                    {/* Order Badge */}
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                      {mat.order_index}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <StatusIcon status={mat.progress_status} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900">
                    <h3 className={`font-semibold mb-1 line-clamp-2 ${isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      {mat.title}
                    </h3>
                    {mat.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{mat.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        {mat.duration_minutes} menit
                      </div>
                      {!isLocked && (
                        <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                          {mat.progress_status === 'completed' ? 'Review' : 'Belajar'}
                          <ArrowRight size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={() => fetchMaterials(false)} disabled={loading}
                className="btn-secondary">
                {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberMaterials;
