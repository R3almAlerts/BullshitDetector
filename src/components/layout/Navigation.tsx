// src/components/layout/Navigation.tsx
import { Link, useLocation } from 'react-router-dom';
import NavItem from './NavItem';

const navItems = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Analyzer', path: '/analyzer', icon: 'shield' },
  { label: 'Sentiment', path: '/sentiment', icon: 'bar-chart' },
  { label: 'History', path: '/history', icon: 'history' },
  { label: 'Profile', path: '/profile', icon: 'user' },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            label={item.label}
            path={item.path}
            icon={item.icon}
            active={location.pathname === item.path}
          />
        ))}
      </ul>
    </nav>
  );
}