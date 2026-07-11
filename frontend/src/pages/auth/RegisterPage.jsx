import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GraduationCap, User, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../utils/request';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
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
          <h1 className="text-3xl font-bold text-white">Daftar Akun</h1>
          <p className="text-gray-400 mt-1">Mulai perjalanan belajar Anda</p>
        </div>

        <div className="card shadow-xl shadow-black/40">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text" placeholder="Nama lengkap Anda"
                  className="input-field pl-10"
                  {...register('name', { required: 'Nama wajib diisi' })}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email" placeholder="email@example.com"
                  className="input-field pl-10"
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Format email tidak valid' }
                  })}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nomor WhatsApp</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text" placeholder="08xxxxxxxxxx"
                  className="input-field pl-10"
                  {...register('whatsapp', { required: 'Nomor WhatsApp wajib diisi' })}
                />
              </div>
              {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="Min. 6 karakter"
                  className="input-field pl-10 pr-10"
                  {...register('password', { required: 'Password wajib diisi', minLength: { value: 6, message: 'Minimal 6 karakter' } })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password" placeholder="Ulangi password"
                  className="input-field pl-10"
                  {...register('confirmPassword', {
                    required: 'Konfirmasi password wajib diisi',
                    validate: value => value === password || 'Password tidak cocok'
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Mendaftar...</> : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
