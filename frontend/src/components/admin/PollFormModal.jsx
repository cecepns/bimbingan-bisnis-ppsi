import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, HelpCircle, Layers } from 'lucide-react';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import { pollService } from '../../utils/request';

const PollFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setQuestion(initialData.question || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');
      if (initialData.options && initialData.options.length > 0) {
        setOptions(initialData.options.map((opt) => opt.option_text || ''));
      } else {
        setOptions(['', '']);
      }
    } else {
      setTitle('');
      setQuestion('');
      setDescription('');
      setStatus('active');
      setOptions(['', '']);
    }
  }, [initialData, isOpen]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 9) {
      toast.error('Maksimal 9 pilihan jawaban.');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      toast.error('Minimal harus ada 2 pilihan jawaban.');
      return;
    }
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error('Pertanyaan polling wajib diisi.');
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      toast.error('Minimal harus ada 2 pilihan jawaban yang terisi.');
      return;
    }
    if (cleanOptions.length > 9) {
      toast.error('Maksimal 9 pilihan jawaban.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim() || 'Polling',
        question: question.trim(),
        description: description.trim() || null,
        status,
        options: cleanOptions,
      };

      if (initialData?.id) {
        await pollService.update(initialData.id, payload);
        toast.success('Polling berhasil diperbarui');
      } else {
        await pollService.create(payload);
        toast.success('Polling berhasil dibuat');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan polling');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Polling' : 'Buat Polling Baru'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Judul / Topik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Judul / Topik Singkat <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Peluang Bisnis P2C"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        {/* Pertanyaan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
            <HelpCircle size={15} className="text-indigo-500" />
            Pertanyaan Polling <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Contoh: Apakah Anda tertarik menjadikan aktivitas belanja sehari-hari sebagai peluang bisnis melalui konsep P2C?"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Keterangan / Deskripsi Tambahan <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Pendapat Anda sangat penting bagi pengembangan ekosistem kami."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Status Polling
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="poll_status"
                value="active"
                checked={status === 'active'}
                onChange={() => setStatus('active')}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-green-600 dark:text-green-400">Aktif (Bisa Diisi User)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="poll_status"
                value="inactive"
                checked={status === 'inactive'}
                onChange={() => setStatus('inactive')}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-500 dark:text-gray-400">Nonaktif (Ditutup)</span>
            </label>
          </div>
        </div>

        {/* Pilihan Jawaban (Options) */}
        <div className="pt-2 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Layers size={16} className="text-indigo-500" />
                Pilihan Jawaban (Opsi) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Minimal 2 pilihan, maksimal hingga 9 pilihan ({options.length}/9 terisi)
              </p>
            </div>
            {options.length < 9 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition"
              >
                <Plus size={14} />
                Tambah Pilihan
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Pilihan ${idx + 1} (contoh: ${
                    idx === 0
                      ? 'Ya, saya tertarik!'
                      : idx === 1
                      ? 'Ingin tahu lebih banyak.'
                      : idx === 2
                      ? 'Menarik, tetapi belum siap.'
                      : 'Belum tertarik.'
                  })`}
                  required
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    title="Hapus Pilihan"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {initialData ? 'Simpan Perubahan' : 'Buat Polling'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PollFormModal;
