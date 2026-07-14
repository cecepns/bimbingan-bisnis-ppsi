import { Loader2, Upload, X, Video, Clock, Image } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import { materialsService } from '../../utils/request';
import { getImageUrl, getYoutubeEmbedUrl } from '../../utils/helpers';

const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  },
};

const MaterialFormModal = ({ isOpen, onClose, editData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [fileAttachment, setFileAttachment] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const youtubeUrl = watch('youtube_url');

  useEffect(() => {
    if (editData) {
      reset({
        title: editData.title,
        description: editData.description,
        youtube_url: editData.youtube_url,
        duration_minutes: editData.duration_minutes,
        order_index: editData.order_index,
        status: editData.status,
      });
      setContent(editData.content || '');
      setThumbnailPreview(editData.thumbnail ? getImageUrl(`thumbnails/${editData.thumbnail}`) : null);
    } else {
      reset({ status: 'draft', duration_minutes: 10 });
      setContent('');
      setThumbnailPreview(null);
    }
  }, [editData, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') formData.append(key, value);
      });
      formData.append('content', content);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      if (fileAttachment) formData.append('file_attachment', fileAttachment);

      if (editData) {
        await materialsService.update(editData.id, formData);
        toast.success('Materi berhasil diupdate');
      } else {
        await materialsService.create(formData);
        toast.success('Materi berhasil ditambahkan');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Materi' : 'Tambah Materi Baru'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Judul Materi *</label>
              <input type="text" className="input-field" placeholder="Judul materi..."
                {...register('title', { required: 'Judul wajib diisi' })} />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Deskripsi Singkat</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Deskripsi singkat..."
                {...register('description')} />
            </div>

            {/* Duration & Order */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Durasi (menit) *</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="number" min="1" className="input-field pl-9"
                    {...register('duration_minutes', { required: true, min: 1 })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Nomor Urut</label>
                <input type="number" min="1" className="input-field"
                  {...register('order_index')} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Status</label>
              <select className="input-field" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
            </div>

            {/* Youtube URL */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">
                <div className="flex items-center gap-2"><Video size={14} className="text-red-400" /> URL Video YouTube (Opsional)</div>
              </label>
              <input type="text" className="input-field" placeholder="https://youtu.be/..."
                {...register('youtube_url')} />
              {youtubeUrl && getYoutubeEmbedUrl(youtubeUrl) && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-video">
                  <iframe src={getYoutubeEmbedUrl(youtubeUrl)} className="w-full h-full" allowFullScreen />
                </div>
              )}
            </div>

            {/* File Attachment */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">File Pendukung (PDF, DOCX, dll)</label>
              <label className="flex items-center gap-3 input-field cursor-pointer">
                <Upload size={16} className="text-gray-500" />
                <span className="text-gray-500 text-sm">{fileAttachment?.name || editData?.file_attachment || 'Pilih file...'}</span>
                <input type="file" className="hidden" accept=".pdf,.docx,.xlsx,.pptx"
                  onChange={(e) => setFileAttachment(e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Thumbnail */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">
                <div className="flex items-center gap-2"><Image size={14} /> Thumbnail</div>
              </label>
              <label className="block cursor-pointer">
                <div className={`relative rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 overflow-hidden flex items-center justify-center ${thumbnailPreview ? 'h-40' : 'h-32'} hover:border-indigo-500/50 transition-colors`}>
                  {thumbnailPreview ? (
                    <>
                      <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium">Ganti Thumbnail</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Upload size={24} className="text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Upload thumbnail (JPG, PNG, WEBP)</p>
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailChange} />
              </label>
            </div>
          </div>
        </div>

        {/* Rich Text Editor - Full Width */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-400 mb-2">Isi Artikel / Materi</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            className="rounded-xl overflow-hidden"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {editData ? 'Simpan Perubahan' : 'Tambah Materi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MaterialFormModal;
