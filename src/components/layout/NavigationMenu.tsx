// src/components/layout/NavigationMenu.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart3, History, Settings, User, Search, Menu, X, ChevronDown, LogOut, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface SubItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: SubItem[];
  protected?: boolean; // New: Flag for auth-required items
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
  { 
    label: 'Analyzer', 
    path: '/analyzer', 
    icon: <BarChart3 className="w-5 h-5" />, 
    protected: true 
  },
  { 
    label: 'Sentiment', 
    path: '/sentiment', 
    icon: <BarChart3 className="w-5 h-5" />, 
    protected: true 
  },
  {
    label: 'Tools',
    path: '/tools',
    icon: <Shield className="w-5 h-5" />,
    children: [
      { label: 'Advanced Validator', path: '/advanced-validator' },
      { label: 'Trend Tracker', path: '/trend-tracker' },
    ],
    protected: true,
  },
  { 
    label: 'History', 
    path: '/history', 
    icon: <History className="w-5 h-5" />, 
    protected: true 
  },
  { 
    label: 'Settings', 
    path: '/settings', 
    icon: <Settings className="w-5 h-5" />, 
    protected: true 
  },
  { 
    label: 'Profile', 
    path: '/profile', 
    icon: <User className="w-5 h-5" />, 
    protected: true 
  },
];

export default function NavigationMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openSubIdx, setOpenSubIdx] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, logout } = useAuth();

  // Filter protected items if not logged in
  const visibleNavItems = navItems.filter((item) => !item.protected || !!user);

  // Outside click handler (mobile + profile + search)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
        setOpenSubIdx(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchOpen && !e.target.closest('.search-container')) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenSubIdx(null);
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const renderDesktopItem = (item: NavItem, idx: number) => {
    const hasChildren = !!item.children?.length;
    const isOpen = openSubIdx === idx;
    const active = isActive(item.path);

    return (
      <li key={item.path} className="relative group" onMouseLeave={() => setOpenSubIdx(null)}>
        <Link
          to={item.path}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            active
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onMouseEnter={() => hasChildren && setOpenSubIdx(idx)}
          aria-haspopup={hasChildren ? 'true' : undefined}
          aria-expanded={hasChildren ? isOpen : undefined}
        >
          {item.icon}
          {item.label}
          {hasChildren && <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </Link>

        <AnimatePresence>
          {hasChildren && isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden"
            >
              {item.children!.map((sub) => (
                <li key={sub.path}>
                  <Link
                    to={sub.path}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  };

  const renderMobileItem = (item: NavItem, idx: number) => {
    const hasChildren = !!item.children?.length;
    const isOpen = openSubIdx === idx;

    return (
      <li key={item.path} className="py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
          onClick={() => (hasChildren ? setOpenSubIdx(isOpen ? null : idx) : navigate(item.path))}
          className={`w-full flex items-center justify-between text-left py-2 px-4 rounded-md transition-colors ${
            isActive(item.path)
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          aria-expanded={hasChildren ? isOpen : undefined}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {item.label}
          </div>
          {hasChildren && <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        </button>

        <AnimatePresence>
          {hasChildren && isOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pl-6"
            >
              {item.children!.map((sub) => (
                <li key={sub.path}>
                  <Link
                    to={sub.path}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <nav ref={menuRef} className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400">
            <Home className="w-6 h-6" />
            Bullshit Detector
          </Link>

          {/* Desktop Menu - Filtered for auth */}
          <ul className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item, idx) => renderDesktopItem(item, idx))}
            {isAdmin && (
              <li>
                <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                  <Shield className="w-5 h-5" />
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Desktop Right: Search + Profile (Profile hidden if not logged in) */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="search-container relative">
              {searchOpen ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search claims..."
                    autoFocus
                    className="w-64 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onBlur={(e) => !e.relatedTarget?.closest('.search-container') && setSearchOpen(false)}
                  />
                  <button type="submit" className="p-2 text-gray-500 hover:text-blue-600">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label="Open search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </form>

            {user ? ( // Conditional: Show profile only if logged in
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:inline">Profile</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden"
                    >
                      <li>
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Settings
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4 inline mr-2" />
                          Logout
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Off-Canvas Menu - Filtered for auth */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 overflow-y-auto"
          >
            <ul className="p-4 space-y-2">
              {visibleNavItems.map((item, idx) => renderMobileItem(item, idx))}
              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Admin
                  </Link>
                </li>
              )}
              <li className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="p-2 text-gray-500 hover:text-blue-600">
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </li>
              {!user && ( // Conditional: Show sign-in link in mobile if not logged in
                <li>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>
    </nav>
  );
}