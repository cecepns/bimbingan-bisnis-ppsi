import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Lock, Camera, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { usersService } from '../../utils/request';

const MemberProfile = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name, whatsapp: user?.whatsapp },
  });

  const { register: registerPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: passErrors }, watch } = useForm();
  const newPassword = watch('new_password');

  const onSaveProfile = async (data) => {
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('whatsapp', data.whatsapp);
      if (avatarFile) formData.append('avatar', avatarFile);
      await usersService.updateProfile(formData);
      await refreshUser();
      toast.success('Profil berhasil diupdate');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setSavingPassword(true);
    try {
      await usersService.changePassword({ current_password: data.current_password, new_password: data.new_password });
      toast.success('Password berhasil diubah');
      resetPassword();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
        <p className="text-gray-400 text-sm mt-1">Kelola informasi akun Anda</p>
      </div>

      {/* Avatar & User Info */}
      <div className="card flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : user?.name?.[0]}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition-colors">
            <Camera size={13} className="text-white" />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <h2 className="text-gray-900 dark:text-white font-bold text-lg">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mt-1">
            Member
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-xl p-1">
        {['profile', 'password'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'profile' ? 'Edit Profil' : 'Ganti Password'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <div className="card">
          <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" className="input-field pl-10"
                  {...registerProfile('name', { required: 'Nama wajib diisi' })} />
              </div>
              {profileErrors.name && <p className="text-red-400 text-xs mt-1">{profileErrors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={user?.email} disabled className="input-field pl-10 opacity-50 cursor-not-allowed" />
              </div>
              <p className="text-gray-600 text-xs mt-1">Email tidak dapat diubah</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Nomor WhatsApp</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" className="input-field pl-10"
                  {...registerProfile('whatsapp', { required: 'WhatsApp wajib diisi' })} />
              </div>
              {profileErrors.whatsapp && <p className="text-red-400 text-xs mt-1">{profileErrors.whatsapp.message}</p>}
            </div>

            <button type="submit" disabled={savingProfile} className="btn-primary w-full flex items-center justify-center gap-2">
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Perubahan
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password Saat Ini</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showCurrentPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  {...registerPassword('current_password', { required: 'Password saat ini wajib diisi' })} />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passErrors.current_password && <p className="text-red-400 text-xs mt-1">{passErrors.current_password.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showNewPass ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  {...registerPassword('new_password', { required: 'Password baru wajib diisi', minLength: { value: 6, message: 'Min. 6 karakter' } })} />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passErrors.new_password && <p className="text-red-400 text-xs mt-1">{passErrors.new_password.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" className="input-field pl-10"
                  {...registerPassword('confirm_password', {
                    required: 'Konfirmasi password wajib diisi',
                    validate: val => val === newPassword || 'Password tidak cocok',
                  })} />
              </div>
              {passErrors.confirm_password && <p className="text-red-400 text-xs mt-1">{passErrors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={savingPassword} className="btn-primary w-full flex items-center justify-center gap-2">
              {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              Ganti Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
