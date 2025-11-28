// src/components/Navigation/Menu.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, ChevronDown, Home, Package, Settings, HelpCircle, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext'; // ← make sure this path is correct in your repo

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
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

const NavigationMenu: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useUser();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSubMenu(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (href?: string) => href === location.pathname;

  // Critical fix: safely read avatar URL
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl : null;

  return (
    <nav ref={menuRef} className="flex items-center justify-between w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700" role="navigation" aria-label="Main navigation">
      {/* Logo + Mobile Toggle */}
      <div className="flex items-center space-x-4 px-4 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">BullshitDetector</a>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center space-x-8">
       