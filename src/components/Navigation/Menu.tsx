import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, ChevronDown, Home, Package, Settings, HelpCircle, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext'; // Assume repo's UserContext for auth

// TypeScript interfaces
interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface NavigationMenuProps {
  items?: MenuItem[]; // Default example items
  className?: string;
}

const defaultItems: MenuItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
  {
    id: 'products',
    label: 'Products',
    href: '/products',
    icon: <Package className="h-4 w-4" />,
    children: [
      { id: 'item1', label: 'Item 1', href: '/products/item1' },
      { id: 'item2', label: 'Item 2', href: '/products/item2' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services',
    icon: <Settings className="h-4 w-4" />,
    children: [
      { id: 'consult', label: 'Consult', href: '/services/consult' },
      { id: 'support', label: 'Support', href: '/services/support' },
    ],
  },
  { id: 'about', label: 'About', href: '/about', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'contact', label: 'Contact', href: '/contact', icon: <Mail className="h-4 w-4" /> },
];

const NavigationMenu: React.FC<NavigationMenuProps> = React.memo(({ items = defaultItems, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useUser(); // From repo's context

  // Outside click detection hook
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileDropdown(false);
      if (activeSubMenu && !menuRef.current?.querySelector(`[data-submenu="${activeSubMenu}"]`)?.contains(event.target as Node)) {
        setActiveSubMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeSubMenu]);

  // Keyboard navigation
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
          setActiveSubMenu(null);
          setShowProfileDropdown(false);
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchQuery('');
      }
    },
    [searchQuery, navigate]
  );

  const handleLogout = useCallback(() => {
    signOut();
    setShowProfileDropdown(false);
  }, [signOut]);

  const isActive = (href: string | undefined) => href === location.pathname;

  return (
    <nav ref={menuRef} className={`flex items-center justify-between w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`} role="navigation" aria-label="Main navigation">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-2 px-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">BullshitDetector</a>
      </div>

      {/* Desktop Horizontal Menu */}
      <ul className="hidden md:flex items-center space-x-8 px-4">
        {items.map((item) => (
          <li key={item.id} className="relative group">
            <a
              href={item.href}
              className={`flex items-center space-x-2 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
              aria-haspopup={!!item.children}
              aria-expanded={activeSubMenu === item.id}
            >
              {item.icon}
              <span className="truncate max-w-[150px]">{item.label}</span>
              {item.children && <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />}
            </a>
            <AnimatePresence>
              {activeSubMenu === item.id && item.children && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 min-w-[200px] z-50"
                  data-submenu={item.id}
                  role="menu"
                >
                  {item.children.map((child) => (
                    <li key={child.id} role="menuitem">
                      <a
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setActiveSubMenu(null)}
                      >
                        {child.label}
                      </a>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>

      {/* Mobile Off-Canvas Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 md:hidden"
            role="menu"
          >
            <div className="p-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`flex items-center space-x-2 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 ${
                        isActive(item.href) ? 'text-blue-600' : ''
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </a>
                    {item.children && (
                      <ul className="ml-4 space-y-2 mt-2 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <a
                              href={child.href}
                              className="block py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
                              onClick={() => setIsOpen(false)}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="flex items-center space-x-4 px-4">
        <form onSubmit={handleSearchSubmit} className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            aria-label="Search claims or topics"
          />
        </form>
        {/* Mobile Search Toggle – expand if needed */}
        <button className="lg:hidden p-2 text-gray-700 dark:text-gray-300" aria-label="Search">
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* User Profile Dropdown */}
      <div ref={profileRef} className="relative px-4">
        <button
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className="flex items-center space-x-2 rounded-full bg-gray-100 dark:bg-gray-800 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-haspopup="true"
          aria-expanded={showProfileDropdown}
        >
          <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {user?.avatarUrl && <img src={user.avatarUrl} alt="Profile" className="h-6 w-6 rounded-full" />}
        </button>
        <AnimatePresence>
          {showProfileDropdown && (
            <motion.ul
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 min-w-[160px] z-50"
              role="menu"
            >
              <li role="menuitem">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Profile
                </a>
              </li>
              <li role="menuitem">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Logout
                </button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />}
    </nav>
  );
});

NavigationMenu.displayName = 'NavigationMenu';

export default NavigationMenu;