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

        <div className="card shadow-2xl border border-white/10 backdrop-blur-xl">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Periksa Email Anda</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Kami telah mengirimkan tautan reset kata sandi ke <br />
                <span className="font-semibold text-indigo-300">{targetEmail}</span>.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-400 text-left space-y-1.5">
                <p>💡 <strong className="text-gray-300">Tips:</strong></p>
                <p>• Link hanya berlaku selama <strong className="text-gray-200">1 jam</strong>.</p>
                <p>• Periksa folder <strong className="text-gray-200">Spam / Junk</strong> jika tidak ada di inbox.</p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  <RefreshCw size={15} /> Kirim ke email lain
                </button>
                <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
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
                    className="input-field pl-10"
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

