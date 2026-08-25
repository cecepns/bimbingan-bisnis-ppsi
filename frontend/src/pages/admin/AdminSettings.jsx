import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Key,
  Server,
  Shield,
  Send,
  Save,
  Loader2,
  HelpCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { settingsService } from '../../utils/request';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 465,
      smtp_secure: true,
      smtp_user: '',
      app_password: '',
      sender_name: 'LMS Bisnis',
      sender_email: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getEmailSettings();
      if (res?.data) {
        reset({
          smtp_host: res.data.smtp_host || 'smtp.gmail.com',
          smtp_port: res.data.smtp_port || 465,
          smtp_secure: res.data.smtp_secure !== false,
          smtp_user: res.data.smtp_user || '',
          app_password: res.data.app_password || '',
          sender_name: res.data.sender_name || 'LMS Bisnis',
          sender_email: res.data.sender_email || '',
        });
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat pengaturan email');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        smtp_port: Number(data.smtp_port),
        smtp_secure: Boolean(data.smtp_secure),
      };
      const res = await settingsService.updateEmailSettings(payload);
      toast.success(res?.message || 'Pengaturan email & App Password berhasil disimpan');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      toast.error('Masukkan alamat email tujuan untuk uji coba');
      return;
    }

    setTesting(true);
    try {
      const res = await settingsService.testEmail({ test_email: testEmail });
      toast.success(res?.message || `Email uji coba berhasil dikirim ke ${testEmail}`);
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim email uji coba. Periksa kredensial SMTP/App Password Anda.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto" />
          <p className="text-gray-400 text-sm">Memuat pengaturan sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Mail className="text-indigo-500" size={26} />
            Pengaturan Email & App Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Konfigurasi SMTP server dan App Password untuk pengiriman email otomatis seperti Reset Password
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="btn-secondary text-sm inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <HelpCircle size={16} className="text-indigo-400" />
          {showGuide ? 'Tutup Panduan' : 'Panduan Gmail App Password'}
        </button>
      </div>

      {/* Gmail App Password Guide Box */}
      {showGuide && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 text-sm text-gray-700 dark:text-gray-300 space-y-3.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
            <Sparkles size={18} />
            Cara Mendapatkan Google App Password (Sandi Aplikasi):
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm pl-1">
            <li>
              Buka akun Google Anda di{' '}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500 underline font-medium"
              >
                myaccount.google.com/security
              </a>
              .
            </li>
            <li>
              Pastikan <strong className="text-gray-900 dark:text-white">Verifikasi 2 Langkah (2-Step Verification)</strong> telah aktif.
            </li>
            <li>
              Cari menu <strong className="text-gray-900 dark:text-white">Sandi Aplikasi (App Passwords)</strong> atau ketik di kolom pencarian Akun Google.
            </li>
            <li>
              Beri nama aplikasi, misal <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 font-mono">LMS Bisnis</span>, lalu klik <strong>Buat (Generate)</strong>.
            </li>
            <li>
              Salin kode 16 digit yang muncul (contoh: <span className="font-mono text-indigo-400">abcd efgh ijkl mnop</span>) dan tempelkan ke kolom <strong className="text-gray-900 dark:text-white">App Password</strong> di bawah.
            </li>
          </ol>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Server size={20} className="text-indigo-500" />
                Konfigurasi SMTP
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Kredensial server email keluar (Outgoing Mail Server)
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* SMTP Host */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    className="input-field"
                    {...register('smtp_host', { required: 'SMTP Host wajib diisi' })}
                  />
                  {errors.smtp_host && (
                    <p className="text-red-500 text-xs mt-1">{errors.smtp_host.message}</p>
                  )}
                </div>

                {/* SMTP Port */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Port
                  </label>
                  <input
                    type="number"
                    placeholder="465"
                    className="input-field"
                    {...register('smtp_port', { required: 'Port wajib diisi' })}
                  />
                  {errors.smtp_port && (
                    <p className="text-red-500 text-xs mt-1">{errors.smtp_port.message}</p>
                  )}
                </div>
              </div>

              {/* Secure SSL/TLS */}
              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="smtp_secure"
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  {...register('smtp_secure')}
                />
                <label htmlFor="smtp_secure" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Gunakan Koneksi Aman SSL/TLS (Direkomendasikan untuk Port 465)
                </label>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* SMTP User */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  SMTP Username / Email Akun
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="contoh@gmail.com"
                    className="input-field pl-10"
                    {...register('smtp_user', { required: 'SMTP User/Email wajib diisi' })}
                  />
                </div>
                {errors.smtp_user && (
                  <p className="text-red-500 text-xs mt-1">{errors.smtp_user.message}</p>
                )}
              </div>

              {/* App Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    App Password (Sandi Aplikasi)
                  </label>
                  <span className="text-xs text-indigo-500 font-medium">16 Karakter</span>
                </div>
                <div className="relative">
                  <Key size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showAppPassword ? 'text' : 'password'}
                    placeholder="Contoh: abcd efgh ijkl mnop"
                    className="input-field pl-10 pr-10 font-mono"
                    {...register('app_password', { required: 'App Password wajib diisi' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAppPassword(!showAppPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showAppPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.app_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.app_password.message}</p>
                )}
                <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-1">
                  <Info size={13} /> Jangan gunakan kata sandi login utama email Anda, gunakan Google App Password 16 digit.
                </p>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Sender Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Nama Pengirim (Sender Name)
                  </label>
                  <input
                    type="text"
                    placeholder="LMS Bisnis"
                    className="input-field"
                    {...register('sender_name')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Email Pengirim (Sender Email)
                  </label>
                  <input
                    type="email"
                    placeholder="noreply@lmsbisnis.com"
                    className="input-field"
                    {...register('sender_email')}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 shadow-lg shadow-indigo-500/20"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={17} /> Simpan Pengaturan Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar: Test Connection & Status */}
        <div className="space-y-6">
          {/* Test Email Card */}
          <div className="card shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Send size={16} className="text-emerald-500" />
                Uji Coba Pengiriman
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                Kirim email percobaan untuk memastikan SMTP & App Password bekerja
              </p>
            </div>

            <form onSubmit={handleTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Penerima Tes
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="emailanda@gmail.com"
                  className="input-field text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5 bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500 shadow-lg shadow-emerald-600/20"
              >
                {testing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Mengirim Tes...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Kirim Email Tes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Feature Info Card */}
          <div className="card shadow-sm border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
              <Shield size={16} className="text-indigo-500" />
              Fitur Terkait Email
            </h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <span><strong>Reset Kata Sandi</strong> otomatis mengirimkan link token verifikasi 1 jam.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>Template email HTML modern responsif & terenkripsi TLS.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>Keamanan terpusat melalui database dan fallback file <code className="text-indigo-400">.env</code>.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
