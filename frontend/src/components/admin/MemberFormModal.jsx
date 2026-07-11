import { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersService } from '../../utils/request';

const MemberFormModal = ({ isOpen, onClose, editData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        whatsapp: editData.whatsapp || '',
        password: '', // Leave empty for edit
      });
    } else {
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
      });
    }
  }, [editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editData) {
        // Update
        await usersService.update(editData.id, formData);
        toast.success('Member berhasil diupdate');
      } else {
        // Create
        await usersService.create(formData);
        toast.success('Member berhasil ditambahkan');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {editData ? 'Edit Member' : 'Tambah Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="memberForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">No WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="input-field"
                placeholder="08123456789"
                required
              />
            </div>

            {!editData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Minimal 6 karakter"
                  required={!editData}
                  minLength={6}
                />
              </div>
            )}
            {editData && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                * Untuk mengubah password, gunakan fitur Reset Password di tabel member.
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            form="memberForm"
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberFormModal;
