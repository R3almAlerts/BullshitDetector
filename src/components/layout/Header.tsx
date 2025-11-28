// src/components/layout/Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, LogOut, Settings, History, BarChart3, Shield, Home } from 'lucide-react';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import { useAuth } from '../../contexts/AuthContext';
import { useUserMode } from '../../contexts/UserModeContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mode } = useUserMode();
  const location = useLocation();

  const isAuthPage = location.pathname === '/auth';
  const isSplashPage = location.pathname === '/splash';

  // Hide header on auth/splash
  if (isAuthPage || isSplashPage) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Bullshit Detector
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-1 justify-center">
            <Navigation />
          </div>

          {/* Right Side: Search + User */}
          <div className="flex items-center gap-4">
            {/* Search (hidden on small screens) */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* User Menu or Login */}
            {user ? (
              <UserMenu user={user} mode={mode} onLogout={logout} />
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} mode={mode} />
    </header>
  );
}