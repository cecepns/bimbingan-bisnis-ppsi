import { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, HelpCircle, Layers, BookOpen, CheckSquare, XSquare } from 'lucide-react';
import Select from 'react-select';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import { pollService, materialsService } from '../../utils/request';
import { useTheme } from '../../contexts/ThemeContext';

const PollFormModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [options, setOptions] = useState(['', '']);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch materials for react-select
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const res = await materialsService.getAll({ limit: 100 });
        const formatted = (res.data || []).map((m) => ({
          value: m.id,
          label: `${m.order_index}. ${m.title}`,
        }));
        setMaterialOptions(formatted);

        // Pre-select if initialData has material_ids or materials
        if (initialData?.materials && initialData.materials.length > 0) {
          const preSelected = initialData.materials.map((m) => ({
            value: m.id,
            label: `${m.order_index}. ${m.title}`,
          }));
          setSelectedMaterials(preSelected);
        } else if (initialData?.material_ids && initialData.material_ids.length > 0) {
          const preSelected = formatted.filter((opt) =>
            initialData.material_ids.includes(opt.value)
          );
          setSelectedMaterials(preSelected);
        }
      } catch (err) {
        console.error('Failed to load materials for select:', err);
      } finally {
        setLoadingMaterials(false);
      }
    };

    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen, initialData]);

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
      if (initialData.materials && initialData.materials.length > 0) {
        setSelectedMaterials(
          initialData.materials.map((m) => ({
            value: m.id,
            label: `${m.order_index}. ${m.title}`,
          }))
        );
      }
    } else {
      setTitle('');
      setQuestion('');
      setDescription('');
      setStatus('active');
      setOptions(['', '']);
      setSelectedMaterials([]);
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

  const handleSelectAllMaterials = () => {
    setSelectedMaterials(materialOptions);
  };

  const handleClearAllMaterials = () => {
    setSelectedMaterials([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error('Pertanyaan polling wajib diisi.');
      return;
    }

    if (!selectedMaterials || selectedMaterials.length === 0) {
      toast.error('Silakan pilih minimal 1 materi tempat polling ini akan dimunculkan.');
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
        material_ids: selectedMaterials.map((m) => m.value),
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

  // Custom react-select styles for dark and light theme
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: state.isFocused
        ? '#6366f1'
        : isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : '#d1d5db',
      borderRadius: '0.75rem',
      padding: '2px 4px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#6366f1',
      },
      fontSize: '0.875rem',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
      overflow: 'hidden',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#6366f1'
        : state.isFocused
        ? isDark
          ? '#374151'
          : '#f3f4f6'
        : 'transparent',
      color: state.isSelected ? '#ffffff' : isDark ? '#f3f4f6' : '#111827',
      fontSize: '0.875rem',
      cursor: 'pointer',
      padding: '8px 12px',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff',
      borderRadius: '0.5rem',
      border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #c7d2fe',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? '#c7d2fe' : '#3730a3',
      fontSize: '0.8125rem',
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? '#c7d2fe' : '#3730a3',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#ef4444',
        color: '#ffffff',
      },
    }),
    input: (base) => ({
      ...base,
      color: isDark ? '#f9fafb' : '#111827',
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#9ca3af' : '#9ca3af',
      fontSize: '0.875rem',
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: isDark ? '#9ca3af' : '#6b7280',
      fontSize: '0.875rem',
    }),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Polling' : 'Buat Polling Baru'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Dimunculkan di Materi Mana Saja (React Select Multi-select & Searchable) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-500/5 border border-indigo-500/20 space-y-2">
          {/* Header Title & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span>Dimunculkan Di Materi Mana Saja?</span>
              <span className="text-red-500 font-bold">*</span>
            </label>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleSelectAllMaterials}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-white/10 shadow-xs transition active:scale-95"
              >
                <CheckSquare size={13} />
                Pilih Semua ({materialOptions.length})
              </button>
              {selectedMaterials.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllMaterials}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-red-200 dark:border-white/10 transition active:scale-95"
                >
                  <XSquare size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Ketik untuk mencari materi. Anda dapat memilih lebih dari satu materi (Multi-select). Polling akan otomatis muncul di bawah materi yang dipilih.
          </p>

          <Select
            isMulti
            isLoading={loadingMaterials}
            options={materialOptions}
            value={selectedMaterials}
            onChange={(selected) => setSelectedMaterials(selected || [])}
            placeholder="Ketik untuk mencari materi..."
            noOptionsMessage={() => 'Materi tidak ditemukan'}
            styles={selectStyles}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            className="react-select-container text-sm"
            classNamePrefix="react-select"
            closeMenuOnSelect={false}
          />
          {selectedMaterials.length > 0 && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              ✓ Polling akan aktif pada {selectedMaterials.length} materi yang dipilih.
            </p>
          )}
        </div>

        {/* Judul / Topik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Judul / Topik Singkat <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Peluang Bisnis P2C"
            className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        {/* Pertanyaan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <HelpCircle size={15} className="text-indigo-500 flex-shrink-0" />
            <span>Pertanyaan Polling</span>
            <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Contoh: Apakah Anda tertarik menjadikan aktivitas belanja sehari-hari sebagai peluang bisnis melalui konsep P2C?"
            required
            className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm leading-relaxed"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Keterangan / Deskripsi Tambahan <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Pendapat Anda sangat penting bagi pengembangan ekosistem kami."
            className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Status Polling
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 mb-2.5">
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Layers size={16} className="text-indigo-500 flex-shrink-0" />
                <span>Pilihan Jawaban (Opsi)</span>
                <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Minimal 2, maksimal hingga 9 pilihan ({options.length}/9 terisi). Member hanya bisa memilih salah satu jawaban.
              </p>
            </div>
            {options.length < 9 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition active:scale-95"
              >
                <Plus size={14} />
                Tambah Pilihan
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 sm:pr-1">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Pilihan ${idx + 1}`}
                  required
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    title="Hapus Pilihan"
                    className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition text-center"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition active:scale-95"
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
