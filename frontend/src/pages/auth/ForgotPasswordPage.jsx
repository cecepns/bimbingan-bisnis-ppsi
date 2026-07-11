import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GraduationCap, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../utils/request';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setSent(true);
      toast.success('Link reset password telah dikirim ke email Anda');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Lupa Password</h1>
          <p className="text-gray-400 mt-1 text-sm">Kami akan kirim link reset ke email Anda</p>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Email Terkirim!</h3>
              <p className="text-gray-400 text-sm">Periksa inbox email Anda dan klik link untuk reset password.</p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 mt-6">
                <ArrowLeft size={16} /> Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" placeholder="email@example.com" className="input-field pl-10"
                    {...register('email', { required: 'Email wajib diisi' })} />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</> : 'Kirim Link Reset'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors">
                <ArrowLeft size={16} /> Kembali ke Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
