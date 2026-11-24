import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, Search, Loader2, CheckCircle2, Calendar, Phone, Mail } from 'lucide-react';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import { TableSkeleton } from '../ui/Skeleton';
import { formatDateTime, debounce } from '../../utils/helpers';
import { pollService } from '../../utils/request';
import toast from 'react-hot-toast';

const PollDetailModal = ({ isOpen, onClose, pollId }) => {
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'voters'
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  // Voters state
  const [voters, setVoters] = useState([]);
  const [votersPagination, setVotersPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [votersLoading, setVotersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOptionFilter, setSelectedOptionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch poll detail
  const fetchPollDetail = useCallback(async () => {
    if (!pollId) return;
    setLoading(true);
    try {
      const res = await pollService.getById(pollId);
      setPoll(res.data);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat detail polling');
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  // Fetch voters
  const fetchVoters = useCallback(async () => {
    if (!pollId || activeTab !== 'voters') return;
    setVotersLoading(true);
    try {
      const res = await pollService.getVoters(pollId, {
        page,
        limit,
        search,
        option_id: selectedOptionFilter || undefined,
      });
      setVoters(res.data);
      setVotersPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar responden');
    } finally {
      setVotersLoading(false);
    }
  }, [pollId, activeTab, page, limit, search, selectedOptionFilter]);

  useEffect(() => {
    if (isOpen && pollId) {
      fetchPollDetail();
      setPage(1);
      setSearch('');
      setSelectedOptionFilter('');
    }
  }, [isOpen, pollId, fetchPollDetail]);

  useEffect(() => {
    if (isOpen && activeTab === 'voters') {
      fetchVoters();
    }
  }, [isOpen, activeTab, fetchVoters]);

  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearch(val);
      setPage(1);
    }, 300),
    []
  );

  if (!isOpen) return null;

  const totalVotes = Number(poll?.total_votes) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={poll?.title || 'Hasil & Responden Polling'}
      size="xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-indigo-500 mb-2" />
          <p className="text-sm text-gray-500">Memuat data polling...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question Banner */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500 text-white uppercase tracking-wider">
              Pertanyaan
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-2 leading-relaxed">
              {poll?.question}
            </h3>
            {poll?.description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                {poll?.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-indigo-500/10 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-indigo-500" />
                Total Responden: <strong className="text-gray-900 dark:text-white">{totalVotes}</strong> orang
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-500" />
                Dibuat: {formatDateTime(poll?.created_at)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                poll?.status === 'active'
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {poll?.status === 'active' ? '● Aktif' : '○ Nonaktif'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'results'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <BarChart3 size={16} />
              Hasil Polling
            </button>
            <button
              onClick={() => setActiveTab('voters')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'voters'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Users size={16} />
              Daftar Responden ({totalVotes})
            </button>
          </div>

          {/* Tab Content: Results */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Distribusi Suara Responden
                </h4>
                <span className="text-xs text-gray-500">
                  {poll?.options?.length || 0} Pilihan Jawaban
                </span>
              </div>

              {poll?.options?.map((opt, idx) => {
                const count = Number(opt.vote_count) || 0;
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

                return (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/40 relative overflow-hidden"
                  >
                    {/* Background Progress Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-indigo-500/10 dark:bg-indigo-500/20 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {opt.option_text}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>{count}</strong> suara
                          </span>
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 min-w-[45px] text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* Foreground Progress Indicator */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content: Voters */}
          {activeTab === 'voters' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    onChange={(e) => debouncedSearch(e.target.value)}
                    placeholder="Cari nama, email, atau whatsapp responden..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Option Filter */}
                <select
                  value={selectedOptionFilter}
                  onChange={(e) => {
                    setSelectedOptionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm outline-none"
                >
                  <option value="">Semua Pilihan Jawaban</option>
                  {poll?.options?.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.option_text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table */}
              {votersLoading ? (
                <TableSkeleton rows={5} />
              ) : voters.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Belum ada data responden"
                  description="Belum ada member yang memberikan suara atau hasil pencarian tidak ditemukan."
                />
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-semibold border-b border-gray-200 dark:border-white/10">
                      <tr>
                        <th className="py-3 px-4">Responden</th>
                        <th className="py-3 px-4">Kontak</th>
                        <th className="py-3 px-4">Pilihan Jawaban</th>
                        <th className="py-3 px-4">Waktu Vote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                      {voters.map((v) => (
                        <tr key={v.vote_id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {v.user_name?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white truncate">
                                {v.user_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Mail size={12} className="text-gray-400" />
                                <span className="truncate">{v.user_email}</span>
                              </div>
                              {v.user_whatsapp && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <Phone size={12} className="text-green-500" />
                                  <span>{v.user_whatsapp}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              <CheckCircle2 size={12} />
                              {v.option_text}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDateTime(v.voted_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <Pagination
                pagination={votersPagination}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}

          {/* Footer Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PollDetailModal;
