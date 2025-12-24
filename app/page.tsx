'use client';

import { useState } from 'react';
import { Login } from '@/components/Login';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; username: string } | null>(null);

  const handleLogin = (username: string, password: string) => {
    // Mock login validation
    if (username === 'admin') {
      setCurrentUser({
        name: 'Administrator',
        username: username
      });
      setIsLoggedIn(true);
    } else {
      alert('Username atau password salah!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard currentUser={currentUser} onLogout={handleLogout} />;
}
