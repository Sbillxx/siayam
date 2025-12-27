'use client';

import { useState } from 'react';
import { Login } from '@/components/Login';
import { Dashboard } from '@/components/Dashboard';
import { Toaster, toast } from 'sonner';

export interface UserSession {
  id: number | string;
  name: string;
  username: string;
  image_url?: string | null;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Login gagal');
        return;
      }

      setCurrentUser({
        id: data.user.user_id,
        name: data.user.name,
        username: data.user.username,
        image_url: data.user.image_url || null
      });
      setIsLoggedIn(true);

    } catch (error) {
      console.error('Login Error:', error);
      toast.error('Terjadi kesalahan koneksi');
    }
  };

  const handleUpdateProfile = (newData: Partial<UserSession>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...newData });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <Dashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}
