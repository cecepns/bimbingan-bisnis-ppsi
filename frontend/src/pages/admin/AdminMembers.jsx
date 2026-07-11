import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, UserCheck, UserX, KeyRound, Users, Loader2, Trash2, Edit2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersService } from '../../utils/request';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatDate, formatDateTime, getProgressPercent, debounce } from '../../utils/helpers';
import { useForm } from 'react-hook-form';
import MemberFormModal from '../../components/admin/MemberFormModal';

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [detailModal, setDetailModal] = useState(null);
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersService.getAll({ page, limit, search });
      setMembers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const debouncedSearch = useCallback(
    debounce((val) => { setSearch(val); setPage(1); }, 300), []
  );

  const handleToggleActive = async (id) => {
    try {
      await usersService.toggleActive(id);
      toast.success('Status member diubah');
      fetchMembers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResetPassword = async (data) => {
    setResetLoading(true);
    try {
      await usersService.resetPassword(resetPasswordModal.id, { new_password: data.new_password });
      toast.success('Password berhasil direset');
      setResetPasswordModal(null);
      reset();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleViewDetail = async (member) => {
    try {
      const res = await usersService.getById(member.id);
      setDetailModal(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await usersService.delete(deleteConfirmModal.id);
      toast.success('Member berhasil dihapus');
      setDeleteConfirmModal(null);
      fetchMembers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (member) => {
    setEditData(member);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditData(null);
    fetchMembers();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Member</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola akun peserta pembelajaran</p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus size={18} /> Tambah Member
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Cari member (nama, email, WhatsApp)..."
            className="input-field pl-10" onChange={(e) => debouncedSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
          ) : members.length === 0 ? (
            <EmptyState icon={Users} title="Belum ada member" description="Belum ada member yang terdaftar" />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>WhatsApp</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Login Terakhir</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const pct = getProgressPercent(member.progress?.completed, member.progress?.total);
                  return (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {member.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-sm text-gray-700 dark:text-gray-300">{member.whatsapp}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                            <div className="progress-bar h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400">{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge status={member.is_active ? 'active' : 'inactive'}>
                          {member.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td><span className="text-xs text-gray-400">{formatDateTime(member.last_login)}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleViewDetail(member)} className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all" title="Detail">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleEdit(member)} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleToggleActive(member.id)} className={`p-2 rounded-lg transition-all ${member.is_active ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'}`} title={member.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                            {member.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                          <button onClick={() => { setResetPasswordModal(member); reset(); }} className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all" title="Reset Password">
                            <KeyRound size={15} />
                          </button>
                          <button onClick={() => setDeleteConfirmModal(member)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Hapus">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {members.length > 0 && (
          <div className="p-4">
            <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Detail Member" size="lg">
        {detailModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {detailModal.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{detailModal.name}</h3>
                <p className="text-gray-400">{detailModal.email}</p>
                <p className="text-gray-400 text-sm">{detailModal.whatsapp}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-gray-100 dark:bg-gray-800/50"><p className="text-xs text-gray-500">Terdaftar</p><p className="text-gray-900 dark:text-white font-medium mt-1">{formatDate(detailModal.created_at)}</p></div>
              <div className="card bg-gray-100 dark:bg-gray-800/50"><p className="text-xs text-gray-500">Login Terakhir</p><p className="text-gray-900 dark:text-white font-medium mt-1">{formatDateTime(detailModal.last_login)}</p></div>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Progress Materi</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detailModal.progress?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gray-700 flex items-center justify-center text-xs text-gray-400">{p.order_index}</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{p.title}</p>
                    </div>
                    <Badge status={p.status || 'locked'}>{p.status === 'completed' ? 'Selesai' : p.status === 'in_progress' ? 'Dipelajari' : p.status === 'available' ? 'Tersedia' : 'Terkunci'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={!!resetPasswordModal} onClose={() => { setResetPasswordModal(null); reset(); }} title="Reset Password Member" size="sm">
        <p className="text-gray-400 text-sm mb-4">Reset password untuk: <b className="text-gray-900 dark:text-white">{resetPasswordModal?.name}</b></p>
        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password Baru</label>
            <input type="password" className="input-field" placeholder="Min. 6 karakter"
              {...register('new_password', { required: 'Password baru wajib diisi', minLength: { value: 6, message: 'Min. 6 karakter' } })} />
            {errors.new_password && <p className="text-red-400 text-xs mt-1">{errors.new_password.message}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => { setResetPasswordModal(null); reset(); }} className="btn-secondary">Batal</button>
            <button type="submit" disabled={resetLoading} className="btn-primary flex items-center gap-2">
              {resetLoading && <Loader2 size={16} className="animate-spin" />} Reset Password
            </button>
          </div>
        </form>
      </Modal>
      {/* Member Form Modal */}
      {showForm && (
        <MemberFormModal
          isOpen={showForm}
          onClose={() => { setShowForm(false); setEditData(null); }}
          editData={editData}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirmModal} onClose={() => setDeleteConfirmModal(null)} title="Hapus Member" size="sm">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Apakah Anda yakin ingin menghapus member <b className="text-gray-900 dark:text-white">"{deleteConfirmModal?.name}"</b>?
          Tindakan ini tidak dapat dibatalkan dan akan menghapus semua progress belajarnya.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteConfirmModal(null)} className="btn-secondary">Batal</button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger flex items-center gap-2">
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMembers;
