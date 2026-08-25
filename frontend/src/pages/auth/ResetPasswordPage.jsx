import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../utils/request';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch('password', '');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenError('Token reset password tidak ditemukan pada URL.');
        setVerifyingToken(false);
        return;
      }

      try {
        const res = await authService.verifyResetToken(token);
        setTokenValid(true);
        setTokenEmail(res?.data?.email || '');
      } catch (err) {
        setTokenValid(false);
        setTokenError(err.message || 'Token tidak valid atau sudah kadaluarsa.');
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        token,
        password: data.password,
      });
      setResetSuccess(true);
      toast.success(res?.message || 'Kata sandi berhasil diatur ulang!');
    } catch (err) {
      toast.error(err.message || 'Gagal mengatur ulang kata sandi');
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Atur Ulang Kata Sandi</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Buat kata sandi baru yang kuat dan aman untuk akun Anda
          </p>
        </div>

        <div className="card shadow-2xl border border-white/10 backdrop-blur-xl">
          {verifyingToken ? (
            <div className="text-center py-10 space-y-3">
              <Loader2 size={36} className="animate-spin text-indigo-400 mx-auto" />
              <p className="text-gray-300 text-sm">Memverifikasi tautan keamanan...</p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-2">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Tautan Tidak Valid</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {tokenError || 'Tautan reset password sudah kadaluarsa (melebihi 1 jam) atau sudah pernah digunakan.'}
              </p>
              <div className="pt-3 flex flex-col gap-2.5">
                <Link
                  to="/forgot-password"
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  <KeyRound size={16} /> Minta Tautan Baru
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2.5"
                >
                  <ArrowLeft size={16} /> Kembali ke Login
                </Link>
              </div>
            </div>
          ) : resetSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Kata Sandi Diperbarui!</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Kata sandi untuk akun <span className="font-semibold text-indigo-300">{tokenEmail}</span> telah berhasil diubah.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  <ArrowLeft size={16} /> Masuk Sekarang
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {tokenEmail && (
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-200">
                  Mereset kata sandi untuk akun: <strong className="text-white font-medium">{tokenEmail}</strong>
                </div>
              )}

              {/* Password Baru */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    className="input-field pl-10 pr-10"
                    {...register('password', {
                      required: 'Kata sandi baru wajib diisi',
                      minLength: {
                        value: 6,
                        message: 'Kata sandi minimal 6 karakter',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ulangi Kata Sandi Baru</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi baru"
                    className="input-field pl-10 pr-10"
                    {...register('confirmPassword', {
                      required: 'Konfirmasi kata sandi wajib diisi',
                      validate: (val) => val === passwordValue || 'Kata sandi tidak cocok',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Kata Sandi Baru'
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <ArrowLeft size={16} /> Batal dan Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
