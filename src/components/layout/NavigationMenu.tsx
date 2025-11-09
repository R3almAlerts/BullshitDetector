// src/components/layout/NavigationMenu.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, History, Settings, User, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'About', path: '/', icon: <Home className="w-5 h-5" /> },
  { label: 'Validator', path: '/validator', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Sentiment', path: '/sentiment', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'History', path: '/history', icon: <History className="w-5 h-5" /> },
  { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  { label: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
];

export default function NavigationMenu() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Hide nav on public pages
  const isPublicPage = ['/', '/splash'].includes(location.pathname);
  if (isPublicPage && location.pathname !== '/') return null;

  // Close mobile menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileOpen]);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${location.pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search & Profile (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {searchOpen && (
              <input
                type="text"
                placeholder="Search..."
                className="px-3 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                autoFocus
              />
            )}
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md
                  ${location.pathname === item.path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t dark:border-gray-700">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}