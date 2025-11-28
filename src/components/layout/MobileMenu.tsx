// src/components/layout/MobileMenu.tsx
import { Link } from 'react-router-dom';
import { X, Home, Shield, BarChart3, History, User, Settings, LogOut } from 'lucide-react';
import { useUserMode } from '../../contexts/UserModeContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  mode: 'voter' | 'professional';
}

export default function MobileMenu({ isOpen, onClose, user, mode }: MobileMenuProps) {
  if (!isOpen) return null;

  const menuItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/analyzer', label: 'Analyzer', icon: Shield },
    { to: '/sentiment', label: 'Sentiment', icon: BarChart3 },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative flex flex-col w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="p-4 border-t dark:border-gray-800">
            <button
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-sm font-medium"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}