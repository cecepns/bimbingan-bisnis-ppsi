import { useState, useEffect, useCallback } from 'react';
import { Vote, Sparkles, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { pollService } from '../../utils/request';
import PollCard from '../../components/member/PollCard';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const MemberPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unvoted' | 'voted'

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pollService.getMemberActive();
      setPolls(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar polling');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleVoted = (pollId, optionId) => {
    // Re-fetch to get accurate updated percentages and counts
    fetchPolls();
  };

  const filteredPolls = polls.filter((p) => {
    if (filter === 'unvoted') return !p.user_vote?.has_voted;
    if (filter === 'voted') return p.user_vote?.has_voted;
    return true;
  });

  const unvotedCount = polls.filter((p) => !p.user_vote?.has_voted).length;
  const votedCount = polls.filter((p) => p.user_vote?.has_voted).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent border border-indigo-500/20 p-4 sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <Vote size={16} />
            Suara & Pendapat Member
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Polling & Survei
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
            Berikan suara Anda pada pertanyaan dan topik terkini untuk membantu kami mengembangkan program dan ekosistem bisnis yang lebih bermanfaat.
          </p>

          {/* Quick Stats Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
              }`}
            >
              Semua Polling ({polls.length})
            </button>
            <button
              onClick={() => setFilter('unvoted')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                filter === 'unvoted'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
              }`}
            >
              <Clock size={14} />
              Belum Diisi ({unvotedCount})
            </button>
            <button
              onClick={() => setFilter('voted')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                filter === 'voted'
                  ? 'bg-green-600 text-white shadow-md shadow-green-500/20'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
              }`}
            >
              <CheckCircle2 size={14} />
              Sudah Diisi ({votedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-500 mb-2" />
          <p className="text-sm text-gray-500">Memuat polling aktif...</p>
        </div>
      ) : filteredPolls.length === 0 ? (
        <EmptyState
          icon={Vote}
          title={
            filter === 'unvoted'
              ? 'Hore! Semua polling sudah Anda isi'
              : filter === 'voted'
              ? 'Belum ada polling yang Anda isi'
              : 'Belum ada polling aktif'
          }
          description={
            filter === 'unvoted'
              ? 'Terima kasih telah berpartisipasi dalam setiap polling kami.'
              : 'Polling baru akan muncul di sini saat admin membuka survei baru.'
          }
        />
      ) : (
        <div className="space-y-6">
          {filteredPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} onVoted={handleVoted} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberPolls;
