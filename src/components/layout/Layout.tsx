// src/components/layout/Layout.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, Settings, LogOut, AlertCircle, History, Users } from 'lucide-react'; // Icons for nav/menu

interface MenuItem {
  label: string;
  path?: string;
  subItems?: MenuItem[];
  icon: React.ComponentType<{ className?: string }>;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth(); // Destructure signOut to fix ReferenceError
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Outside click detection for closing menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (!signOut) {
      console.warn('signOut not available—check AuthContext');
      return;
    }
    try {
      await signOut();
      navigate('/', { replace: true });
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Menu items (responsive: full on desktop, collapsed on mobile)
  const navItems: MenuItem[] = [
    { label: 'Validator', path: '/validator', icon: AlertCircle },
    { label: 'Sentiment', path: '/sentiment', icon: User }, // Sub-items for detail if needed
    { label: 'History', path: '/history', icon: History },
  ];

  const userMenuItems: MenuItem[] = [
    { label: 'Profile', path: '/profile', icon: User },
    ...(role === 'admin' ? [{ label: 'Users', path: '/users', icon: Users }] : []),
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Logout', onClick: handleLogout, icon: LogOut }, // Note: onClick instead of path
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                Bullshit Detector
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path || '#'}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu (Desktop) */}
            {user && (
              <div ref={userMenuRef} className="relative ml-4">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline">{role?.toUpperCase()}</span>
                </button>
                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <ul className="py-1">
                      {userMenuItems.map((item, index) => (
                        <li key={index}>
                          {item.path ? (
                            <Link
                              to={item.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full text-left"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.label}
                            </Link>
                          ) : (
                            <button
                              onClick={item.onClick}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full text-left"
                              aria-label={item.label}
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.label}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Slide-Down) */}
        {isMenuOpen && (
          <div ref={menuRef} className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <ul className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path || '#'}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Mobile User Menu (Simplified) */}
              {user && (
                <li className="-mx-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as {role}</p>
                    {userMenuItems.slice(0, -1).map((item, index) => ( // Exclude Logout for separate
                      <Link
                        key={index}
                        to={item.path || '#'}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition mt-1 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition mt-1 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;