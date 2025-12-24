'use client';

import {
  FileText,
  Bird,
  Heart,
  Wrench,
  Wheat,
  Home,
  BarChart3,
  User,
  X,
  Egg
} from 'lucide-react';
import { PageType } from './Dashboard';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface MenuItem {
  id: PageType;
  label: string;
  icon: React.ReactNode;
}

export const menuItems: MenuItem[] = [
  { id: 'analitik', label: 'Analitik', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'laporan-harian', label: 'Laporan', icon: <FileText className="w-5 h-5" /> },
  { id: 'data-ayam', label: 'Ayam', icon: <Bird className="w-5 h-5" /> },
  { id: 'kesehatan', label: 'Kesehatan', icon: <Heart className="w-5 h-5" /> },
  { id: 'perawatan', label: 'Perawatan', icon: <Wrench className="w-5 h-5" /> },
  { id: 'pakan', label: 'Pakan', icon: <Wheat className="w-5 h-5" /> },
  { id: 'kandang', label: 'Kandang', icon: <Home className="w-5 h-5" /> },
  { id: 'profil', label: 'Akun', icon: <User className="w-5 h-5" /> },
];

export function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-green-800 text-white transform transition-transform duration-200 ease-in-out
        `}
      >
        <div className="p-6 border-b border-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Egg className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-white">SI Ayam Petelur</h2>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 hover:bg-green-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onPageChange(item.id);
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${currentPage === item.id
                      ? 'bg-green-600 text-white'
                      : 'text-green-100 hover:bg-green-700'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
