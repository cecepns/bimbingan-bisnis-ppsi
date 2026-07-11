import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Copy, Eye, ArrowUp, ArrowDown, Loader2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { materialsService } from '../../utils/request';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDate, getImageUrl, debounce } from '../../utils/helpers';
import MaterialFormModal from '../../components/admin/MaterialFormModal';

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await materialsService.getAll({ page, limit, search, status: statusFilter, ...params });
      setMaterials(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const debouncedSearch = useCallback(
    debounce((val) => { setSearch(val); setPage(1); }, 300), []
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await materialsService.delete(deleteModal.id);
      toast.success('Materi berhasil dihapus');
      setDeleteModal(null);
      fetchMaterials();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await materialsService.duplicate(id);
      toast.success('Materi berhasil diduplikasi');
      fetchMaterials();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (material) => {
    setEditData(material);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditData(null);
    fetchMaterials();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Materi</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola seluruh materi pembelajaran</p>
        </div>
        <button onClick={() => { setEditData(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={18} /> Tambah Materi
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Cari materi..."
              className="input-field pl-10"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field max-w-xs"
          >
            <option value="">Semua Status</option>
            <option value="publish">Publish</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
          ) : materials.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Belum ada materi"
              description="Tambahkan materi pertama Anda"
              action={<button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Tambah Materi</button>}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Materi</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, idx) => (
                  <tr key={mat.id}>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {mat.order_index}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        {mat.thumbnail ? (
                          <img src={getImageUrl(`thumbnails/${mat.thumbnail}`)} alt={mat.title} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <BookOpen size={18} className="text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{mat.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{mat.description || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{mat.duration_minutes} menit</span>
                    </td>
                    <td>
                      <Badge status={mat.status}>{mat.status === 'publish' ? 'Publish' : 'Draft'}</Badge>
                    </td>
                    <td>
                      <span className="text-xs text-gray-400">{formatDate(mat.created_at)}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(mat)} className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDuplicate(mat.id)} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Duplikasi">
                          <Copy size={15} />
                        </button>
                        <button onClick={() => setDeleteModal(mat)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Hapus">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {materials.length > 0 && (
          <div className="p-4">
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
            />
          </div>
        )}
      </div>

      {/* Material Form Modal */}
      {showForm && (
        <MaterialFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditData(null); }}
          editData={editData}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Hapus Materi" size="sm">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Apakah Anda yakin ingin menghapus materi <b className="text-gray-900 dark:text-white">"{deleteModal?.title}"</b>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary">Batal</button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex items-center gap-2">
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMaterials;
