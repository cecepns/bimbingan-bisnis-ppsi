import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Lock, Download, Timer, Loader2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { materialsService, progressService } from '../../utils/request';
import { getImageUrl, getYoutubeEmbedUrl } from '../../utils/helpers';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const MaterialDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Timer state
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const minSeconds = material ? material.duration_minutes * 60 : 0;
  const timerComplete = timeSpent >= minSeconds;
  const progress = Math.min(100, (timeSpent / (minSeconds || 1)) * 100);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await materialsService.getById(id);
        setMaterial(res.data);

        // If already in_progress or completed, don't reset timer to 0
        const prog = res.data.progress;
        if (prog?.status === 'in_progress' || prog?.status === 'available') {
          setTimerActive(true);
          startTimeRef.current = Date.now();
        }
      } catch (err) {
        toast.error(err.message);
        navigate('/member/materials');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();

    return () => clearInterval(intervalRef.current);
  }, [id]);

  // Timer tick
  useEffect(() => {
    if (timerActive && !timerComplete) {
      intervalRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive, timerComplete]);

  const handleComplete = async () => {
    if (!timerComplete) return;
    setCompleting(true);
    try {
      const ua = navigator.userAgent;
      const res = await progressService.complete(id, {
        time_spent: timeSpent,
        device: /Mobile|Tablet/.test(ua) ? 'Mobile' : 'Desktop',
        browser: ua.split(' ').slice(-1)[0].split('/')[0],
      });
      toast.success('🎉 Materi berhasil diselesaikan!');
      if (res.data?.nextUnlocked) {
        toast.success(`Materi "${res.data.nextUnlocked.title}" telah terbuka!`, { duration: 4000 });
      }
      navigate('/member');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!material) return null;

  const isCompleted = material.progress?.status === 'completed';
  const embedUrl = getYoutubeEmbedUrl(material.youtube_url);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft size={18} /> Kembali
      </button>

      {/* Hero Image */}
      {(material.thumbnail || material.cover_image) && (
        <div className="rounded-2xl overflow-hidden aspect-video">
          <img
            src={getImageUrl(`thumbnails/${material.thumbnail || material.cover_image}`)}
            alt={material.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            {material.order_index}
          </span>
          <span className="flex items-center gap-1"><Clock size={14} /> {material.duration_minutes} menit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{material.title}</h1>
        {material.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">{material.description}</p>
        )}
      </div>

      {/* Progress Timer */}
      {!isCompleted && (
        <div className="card border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3 mb-4">
            <Timer size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-gray-900 dark:text-white font-semibold">Timer Belajar</h3>
            <span className="ml-auto text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatTime(timeSpent)}</span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden mb-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{timerComplete ? '✓ Waktu belajar minimum tercapai' : `Minimal ${material.duration_minutes} menit`}</span>
            <span>{formatTime(minSeconds)}</span>
          </div>
        </div>
      )}

      {/* YouTube Video */}
      {embedUrl && (
        <div className="rounded-2xl overflow-hidden aspect-video">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Article Content */}
      {material.content && (
        <div className="card">
          <div
            className="prose dark:prose-invert prose-sm max-w-none text-gray-700 dark:text-gray-300
              [&_h1]:text-gray-900 dark:[&_h1]:text-white [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h3]:text-gray-900 dark:[&_h3]:text-white
              [&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:no-underline hover:[&_a]:underline
              [&_img]:rounded-xl [&_img]:w-full [&_blockquote]:border-indigo-500 [&_blockquote]:bg-indigo-500/5 [&_blockquote]:rounded-xl [&_blockquote]:px-4
              [&_code]:bg-gray-100 dark:[&_code]:bg-gray-800 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-gray-100 dark:[&_pre]:bg-gray-800 [&_pre]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: material.content }}
          />
        </div>
      )}

      {/* File Attachment */}
      {material.file_attachment && (
        <div className="card">
          <h3 className="text-gray-900 dark:text-white font-semibold mb-3">File Pendukung</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={getImageUrl(`files/${material.file_attachment}`)}
              download
              className="flex-1 flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-gray-700 dark:text-gray-300 text-sm truncate">{material.file_attachment}</span>
              <span className="ml-auto text-indigo-600 dark:text-indigo-400 text-sm font-medium">Download</span>
            </a>
            {material.file_attachment.toLowerCase().endsWith('.pdf') && (
              <a
                href={getImageUrl(`files/${material.file_attachment}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium transition-colors"
              >
                <Eye size={18} />
                <span>Preview PDF</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Complete Button */}
      <div className="sticky bottom-4 z-10">
        {isCompleted ? (
          <div className="flex items-center justify-center gap-3 p-4 bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30 rounded-2xl">
            <CheckCircle size={22} className="text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 font-semibold">Materi Ini Sudah Diselesaikan</span>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={!timerComplete || completing}
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              timerComplete
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/30 active:scale-95'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-300 dark:border-white/5'
            }`}
          >
            {completing ? (
              <><Loader2 size={20} className="animate-spin" /> Menyimpan...</>
            ) : timerComplete ? (
              <><CheckCircle size={20} /> Tandai Materi Selesai</>
            ) : (
              <><Lock size={20} /> Selesaikan timer belajar terlebih dahulu</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialDetailPage;
