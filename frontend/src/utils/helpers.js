const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://api.kingcreativestudio.my.id/ppsi';

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}/uploads/${path}`;
};

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

export const formatDurationDisplay = (seconds, minutes) => {
  const totalSec = seconds != null && Number(seconds) > 0
    ? Number(seconds)
    : (minutes ? Number(minutes) * 60 : 0);
  if (!totalSec || totalSec <= 0) return '0 detik';
  if (totalSec < 60) return `${totalSec} detik`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (s === 0) return `${m} menit`;
  return `${m} menit ${s} detik`;
};

export const getProgressPercent = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

export const getStatusLabel = (status) => {
  const labels = {
    locked: 'Terkunci',
    available: 'Tersedia',
    in_progress: 'Sedang Dipelajari',
    completed: 'Selesai',
  };
  return labels[status] || status;
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const id = match && match[2].length === 11 ? match[2] : null;
  return id ? `https://www.youtube.com/embed/${id}` : null;
};
