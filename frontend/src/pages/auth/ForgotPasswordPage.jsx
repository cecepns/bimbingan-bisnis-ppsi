import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GraduationCap, Mail, ArrowLeft, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../utils/request';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.forgotPassword(data);
      setTargetEmail(data.email);
      setSent(true);
      toast.success(res?.message || 'Link reset password telah dikirim ke email Anda');
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim link reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lupa Password</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {sent ? 'Tautan atur ulang berhasil dikirim' : 'Masukkan email terdaftar untuk menerima link reset kata sandi'}
          </p>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {sent ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-white font-bold text-xl">Periksa Email Anda</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Kami telah mengirimkan tautan reset kata sandi ke <br />
                <span className="font-semibold text-indigo-400">{targetEmail}</span>
              </p>
              <div className="bg-gray-800/80 border border-gray-700/80 rounded-xl p-4 text-xs text-gray-300 text-left space-y-2">
                <p className="font-medium text-amber-400 flex items-center gap-1.5">
                  <span>💡</span> <strong>Tips Penting:</strong>
                </p>
                <p className="text-gray-300">• Link tautan hanya berlaku selama <strong className="text-white">1 jam</strong>.</p>
                <p className="text-gray-300">• Periksa folder <strong className="text-white">Spam / Junk</strong> jika email tidak ditemukan di inbox.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all duration-200 active:scale-95"
                >
                  <RefreshCw size={15} /> Kirim ke email lain
                </button>
                <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5 shadow-lg shadow-indigo-600/30">
                  <ArrowLeft size={16} /> Kembali ke Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Alamat Email Terdaftar</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    className="w-full bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    {...register('email', {
                      required: 'Email wajib diisi',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Format email tidak valid',
                      },
                    })}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Mengirim Link...</> : 'Kirim Link Reset Password'}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <ArrowLeft size={16} /> Ingat kata sandi? Masuk sekarang
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

