'use client';

import { User as UserIcon, LogOut } from 'lucide-react';
import { User } from '@/lib/types';

interface UserProfileProps {
  currentUser: { name: string; username: string } | null;
  onLogout: () => void;
}

export function UserProfile({ currentUser, onLogout }: UserProfileProps) {
  // Mapping current session user to ERD structure visually
  // In real app, we would fetch the full User object
  const userProfile: User = {
    user_id: '1',
    username: currentUser?.username || 'admin',
    nama_lengkap: currentUser?.name || 'Administrator',
    role: 'admin',
    created_at: '2024-01-01 10:00:00'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Kelola profil pengguna</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-gray-900 text-center mb-1">{userProfile.nama_lengkap}</h2>
              <p className="text-gray-600 text-center mb-4">@{userProfile.username}</p>
              <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full">
                {userProfile.role}
              </span>
              <p className="text-xs text-gray-400 mt-4">Bergabung sejak: {userProfile.created_at}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-gray-900 mb-6">Informasi Akun</h2>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    defaultValue={userProfile.nama_lengkap}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={userProfile.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={userProfile.role}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-gray-900 mb-4">Keluar</h2>
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}