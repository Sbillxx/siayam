'use client';

import { PageType } from './Dashboard';
import { menuItems } from './Sidebar';

interface MobileNavProps {
    currentPage: PageType;
    onPageChange: (page: PageType) => void;
}

export function MobileNav({ currentPage, onPageChange }: MobileNavProps) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
            <nav className="overflow-x-auto">
                <div className="flex px-4 py-2 min-w-max gap-4 mx-auto justify-start md:justify-center">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
                            className={`
                flex flex-col items-center justify-center p-2 min-w-[72px] rounded-lg transition-colors
                ${currentPage === item.id
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-gray-500 hover:text-green-600 hover:bg-gray-50'
                                }
              `}
                        >
                            <div className="mb-1">
                                {item.icon}
                            </div>
                            <span className="text-xs font-medium whitespace-nowrap">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
