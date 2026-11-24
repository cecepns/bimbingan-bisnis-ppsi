import { useEffect, useState, useCallback } from 'react';
import {
  Vote, Plus, Search, Eye, Edit2, Trash2, CheckCircle2,
  XCircle, Users, BarChart3, Loader2, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { pollService } from '../../utils/request';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDateTime, debounce } from '../../utils/helpers';
import PollFormModal from '../../components/admin/PollFormModal';
import PollDetailModal from '../../components/admin/PollDetailModal';

const AdminPolls = () => {
  const [polls, setPolls] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detailPollId, setDetailPollId] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pollService.getAll({
        page,
        limit,
        search,
        status: statusFilter,
      });
      setPolls(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data polling');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const debouncedSearch = useCallback(
    debounce((val) => {
      setSearch(val);
      setPage(1);
    }, 300),
    []
  );

  const handleToggleStatus = async (poll) => {
    const nextStatus = poll.status === 'active' ? 'inactive' : 'active';
    try {
      await pollService.toggleStatus(poll.id, { status: nextStatus });
      toast.success(`Polling sekarang ${nextStatus === 'active' ? 'Aktif' : 'Nonaktif'}`);
      fetchPolls();
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah status polling');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmModal) return;
    setDeleting(true);
    try {
      await pollService.delete(deleteConfirmModal.id);
      toast.success('Polling berhasil dihapus');
      setDeleteConfirmModal(null);
      fetchPolls();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus polling');
    } finally {
      setDeleting(false);
    }
  };

  // Stats calculation
  const totalPolls = pagination.total || 0;
  const activePollsCount = polls.filter((p) => p.status === 'active').length;
  const totalVotesCount = polls.reduce((acc, curr) => acc + (Number(curr.total_votes) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Vote className="text-indigo-600 dark:text-indigo-400" size={28} />
            Manajemen Polling
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola jajak pendapat (polling) dan survei interaktif untuk seluruh member aplikasi.
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setShowFormModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition self-start sm:self-auto"
        >
          <Plus size={18} />
          Buat Polling Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Polling</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Vote size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalPolls}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Polling Aktif di Halaman</span>
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{activePollsCount}</p>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Suara Masuk</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalVotesCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              onChange={(e) => debouncedSearch(e.target.value)}
              placeholder="Cari pertanyaan polling atau topik..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none transition cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Hanya Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-4">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : polls.length === 0 ? (
          <EmptyState
            icon={Vote}
            title="Tidak ada polling ditemukan"
            description="Mulai buat polling pertama Anda untuk mendapatkan feedback dari para member."
            actionText="Buat Polling"
            onAction={() => {
              setEditData(null);
              setShowFormModal(true);
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-semibold border-b border-gray-200 dark:border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Pertanyaan & Topik</th>
                    <th className="py-3.5 px-4 text-center">Pilihan</th>
                    <th className="py-3.5 px-4 text-center">Responden</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Tanggal Dibuat</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {polls.map((p) => {
                    const totalVotes = Number(p.total_votes) || 0;
                    const optionsCount = p.options?.length || Number(p.total_options) || 0;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                        {/* Pertanyaan */}
                        <td className="py-4 px-4 max-w-xs sm:max-w-md">
                          <div className="space-y-1">
                            <span className="inline-block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                              {p.title || 'Polling'}
                            </span>
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                              {p.question}
                            </p>
                            {p.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Pilihan (Badge) */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {optionsCount} Opsi
                          </span>
                        </td>

                        {/* Responden (Badge) */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Users size={12} />
                            {totalVotes} suara
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            title="Klik untuk mengubah status"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                              p.status === 'active'
                                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
                            }`}
                          >
                            {p.status === 'active' ? (
                              <>
                                <CheckCircle2 size={13} />
                                Aktif
                              </>
                            ) : (
                              <>
                                <XCircle size={13} />
                                Nonaktif
                              </>
                            )}
                          </button>
                        </td>

                        {/* Tanggal */}
                        <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDateTime(p.created_at)}
                        </td>

                        {/* Aksi */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Lihat Hasil & Responden */}
                            <button
                              onClick={() => setDetailPollId(p.id)}
                              title="Lihat Hasil & Responden"
                              className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition"
                            >
                              <Eye size={17} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditData(p);
                                setShowFormModal(true);
                              }}
                              title="Edit Polling"
                              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                            >
                              <Edit2 size={17} />
                            </button>

                            {/* Hapus */}
                            <button
                              onClick={() => setDeleteConfirmModal(p)}
                              title="Hapus Polling"
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              pagination={pagination}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      <PollFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditData(null);
        }}
        onSuccess={() => fetchPolls()}
        initialData={editData}
      />

      {/* Detail & Responden Modal */}
      {detailPollId && (
        <PollDetailModal
          isOpen={Boolean(detailPollId)}
          onClose={() => setDetailPollId(null)}
          pollId={detailPollId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmModal)}
        onClose={() => setDeleteConfirmModal(null)}
        title="Hapus Polling"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Apakah Anda yakin ingin menghapus polling{' '}
            <strong className="text-gray-900 dark:text-white">
              "{deleteConfirmModal?.question}"
            </strong>
            ? Seluruh data suara dan responden pada polling ini juga akan dihapus permanen.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setDeleteConfirmModal(null)}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 transition"
            >
              {deleting && <Loader2 size={16} className="animate-spin" />}
              Hapus Polling
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPolls;
