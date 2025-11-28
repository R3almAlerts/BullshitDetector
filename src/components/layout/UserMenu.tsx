// src/components/layout/UserMenu.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, History, LogOut, Crown } from 'lucide-react';

interface UserMenuProps {
  user: any;
  mode: 'voter' | 'professional';
  onLogout: () => void;
}

export default function UserMenu({ user, mode, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user.email[0].toUpperCase()}
        </div>
        <span className="hidden md:block text-sm font-medium">{mode === 'professional' ? 'Pro' : 'Voter'}</span>
        {mode === 'professional' && <Crown className="h-4 w-4 text-yellow-500" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
            <div className="p-3 border-b dark:border-gray-700">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-gray-500">{mode === 'professional' ? 'Professional Mode' : 'Voter Mode'}</p>
            </div>
            <div className="py-1">
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link to="/history" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                <History className="h-4 w-4" /> History
              </Link>
              <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}