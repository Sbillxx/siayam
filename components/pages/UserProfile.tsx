'use client';

import { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogOut, Lock, Camera, UserCog, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileProps {
  currentUser: { id: number | string; name: string; username: string; image_url?: string | null } | null;
  onLogout: () => void;
  onUpdateProfile: (newData: any) => void;
}

export function UserProfile({ currentUser, onLogout, onUpdateProfile }: UserProfileProps) {
  const userId = currentUser?.id || 1;

  const [profile, setProfile] = useState({
    nama_lengkap: currentUser?.name || '',
    username: currentUser?.username || '',
    image_url: currentUser?.image_url || null
  });

  // Keep internal state in sync if props change (e.g. from parent)
  useEffect(() => {
    if (currentUser) {
      setProfile({
        nama_lengkap: currentUser.name,
        username: currentUser.username,
        image_url: currentUser.image_url || null
      });
    }
  }, [currentUser]);

  const [passForm, setPassForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState({
    nama: false,
    username: false,
    image: false,
    password: false
  });

  const [messages, setMessages] = useState<{ [key: string]: { type: 'success' | 'error', text: string } | null }>({
    nama: null,
    username: null,
    image: null,
    password: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        setLoading((prev) => ({ ...prev, image: true }));
        try {
          const res = await fetch('/api/auth/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, image_url: base64, update_type: 'image' })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          // Update Global State
          onUpdateProfile({ image_url: base64 });
        } catch (error: any) {
          toast.error("Gagal menyimpan foto: " + error.message);
        } finally {
          setLoading((prev) => ({ ...prev, image: false }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = async (field: 'nama' | 'username') => {
    setMessages({ ...messages, [field]: null });
    setLoading({ ...loading, [field]: true });

    try {
      const body: any = { user_id: userId, update_type: field };
      if (field === 'nama') body.nama_lengkap = profile.nama_lengkap;
      if (field === 'username') body.username = profile.username;

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan');

      // Update Global State
      if (field === 'nama') onUpdateProfile({ name: profile.nama_lengkap });
      if (field === 'username') onUpdateProfile({ username: profile.username });

      setMessages((prev) => ({ ...prev, [field]: { type: 'success', text: 'Berhasil diperbarui!' } }));
      setTimeout(() => setMessages((prev) => ({ ...prev, [field]: null })), 3000);
    } catch (error: any) {
      setMessages((prev) => ({ ...prev, [field]: { type: 'error', text: error.message } }));
    } finally {
      setLoading({ ...loading, [field]: false });
    }
  };

  const handleChangePassword = async () => {
    setMessages({ ...messages, password: null });
    if (!passForm.oldPassword || !passForm.newPassword || !passForm.confirmPassword) {
      setMessages((prev) => ({ ...prev, password: { type: 'error', text: 'Lengkapi semua kolom' } }));
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setMessages((prev) => ({ ...prev, password: { type: 'error', text: 'Konfirmasi tidak cocok' } }));
      return;
    }

    setLoading({ ...loading, password: true });
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          oldPassword: passForm.oldPassword,
          newPassword: passForm.newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengubah password');

      setMessages((prev) => ({ ...prev, password: { type: 'success', text: 'Password diperbarui!' } }));
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessages((prev) => ({ ...prev, password: null })), 3000);
    } catch (error: any) {
      setMessages((prev) => ({ ...prev, password: { type: 'error', text: error.message } }));
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-gray-900 mb-2 font-bold text-2xl">Pengaturan Akun</h1>
        <p className="text-gray-600">Kelola informasi profil dan keamanan akun Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 border-r border-gray-100 pr-0 lg:pr-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center sticky top-6">
            <div className="relative">
              <div className={`w-36 h-36 bg-green-50 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg transition-all ${loading.image ? 'opacity-50 blur-[1px]' : ''}`}>
                {profile.image_url ? (
                  <img src={profile.image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-green-600" />
                )}
                {loading.image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-green-600 text-white p-2.5 rounded-full shadow-xl hover:bg-green-700 transition-all hover:scale-110 active:scale-95"
                title="Ganti Foto (Otomatis Simpan)"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-900">{profile.nama_lengkap}</h2>
            <p className="text-gray-500 mb-6 font-medium">@{profile.username}</p>

            <div className="w-full space-y-3 pt-4 border-t border-gray-50">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Role</span>
                <span className="text-green-600">ADMINISTRATOR</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Status</span>
                <span className="text-blue-500">ONLINE</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="mt-8 w-full py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white flex items-center justify-center gap-2 font-bold transition-all border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>

        {/* Right Column: Settings Sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Nama Lengkap */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Ubah Nama Lengkap
              </span>
              {messages.nama && (
                <span className={`text-xs px-3 py-1 rounded-full animate-bounce ${messages.nama.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {messages.nama.text}
                </span>
              )}
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={profile.nama_lengkap}
                onChange={(e) => setProfile({ ...profile, nama_lengkap: e.target.value })}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Nama Lengkap Baru"
              />
              <button
                onClick={() => updateField('nama')}
                disabled={loading.nama}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all disabled:opacity-50 shadow-md shadow-green-100"
              >
                {loading.nama ? '...' : 'Simpan'}
              </button>
            </div>
          </div>

          {/* Section 2: Username */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-blue-600" />
                Ubah Username
              </span>
              {messages.username && (
                <span className={`text-xs px-3 py-1 rounded-full animate-bounce ${messages.username.type === 'success' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {messages.username.text}
                </span>
              )}
            </h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Username Baru"
                />
              </div>
              <button
                onClick={() => updateField('username')}
                disabled={loading.username}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all disabled:opacity-50 shadow-md shadow-blue-100"
              >
                {loading.username ? '...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Section 3: Keamanan Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:border-orange-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-500" />
                Keamanan Kata Sandi
              </span>
              {messages.password && (
                <span className={`text-xs px-3 py-1 rounded-full animate-bounce ${messages.password.type === 'success' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                  {messages.password.text}
                </span>
              )}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 mb-1.5 text-xs font-bold uppercase tracking-wider">Password Lama</label>
                <input
                  type="password"
                  value={passForm.oldPassword}
                  onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="Masukkan password saat ini"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1.5 text-xs font-bold uppercase tracking-wider">Password Baru</label>
                  <input
                    type="password"
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="Min. 6 karakter"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1.5 text-xs font-bold uppercase tracking-wider">Konfirmasi</label>
                  <input
                    type="password"
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={loading.password}
                  className="w-full md:w-auto px-10 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold transition-all disabled:opacity-50 shadow-lg shadow-orange-100"
                >
                  {loading.password ? 'Sedang Memproses...' : 'Ubah Password'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}