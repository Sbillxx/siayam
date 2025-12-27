import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { LaporanHarian } from './pages/LaporanHarian';
import { DataAyam } from './pages/DataAyam';
import { Kesehatan } from './pages/Kesehatan';
import { Perawatan } from './pages/Perawatan';
import { Pakan } from './pages/Pakan';
import { Kandang } from './pages/Kandang';
import { Analitik } from './pages/Analitik';
import { UserProfile } from './pages/UserProfile';
import { User as UserIcon } from 'lucide-react';

interface DashboardProps {
  currentUser: { id: number | string; name: string; username: string; image_url?: string | null } | null;
  onLogout: () => void;
  onUpdateProfile: (newData: any) => void;
}

export type PageType =
  | 'analitik'
  | 'laporan-harian'
  | 'data-ayam'
  | 'kesehatan'
  | 'perawatan'
  | 'pakan'
  | 'kandang'
  | 'profil';

export function Dashboard({ currentUser, onLogout, onUpdateProfile }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('laporan-harian');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'analitik':
        return <Analitik />;
      case 'laporan-harian':
        return <LaporanHarian />;
      case 'data-ayam':
        return <DataAyam />;
      case 'kesehatan':
        return <Kesehatan />;
      case 'perawatan':
        return <Perawatan />;
      case 'pakan':
        return <Pakan />;
      case 'kandang':
        return <Kandang />;
      case 'profil':
        return (
          <UserProfile
            currentUser={currentUser}
            onLogout={onLogout}
            onUpdateProfile={onUpdateProfile}
          />
        );
      default:
        return <LaporanHarian />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full relative">
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="hidden lg:block flex-1" />
            <div className="block lg:hidden flex-1 font-bold text-green-800">
              SI Ayam Petelur
            </div>
            <button
              onClick={() => setCurrentPage('profil')}
              className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 p-1.5 rounded-xl transition-all active:scale-95 group"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">{currentUser?.name}</div>
                <div className="text-xs text-gray-500">@{currentUser?.username}</div>
              </div>
              <div className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden bg-green-50 flex items-center justify-center group-hover:border-green-200 transition-all">
                {currentUser?.image_url ? (
                  <img src={currentUser.image_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-green-600" />
                )}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto mb-16 lg:mb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <MobileNav
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
