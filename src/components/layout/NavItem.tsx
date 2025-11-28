// src/components/layout/NavItem.tsx
import { Link } from 'react-router-dom';
import { Home, Shield, BarChart3, History, User } from 'lucide-react';

const icons = {
  home: Home,
  shield: Shield,
  'bar-chart': BarChart3,
  history: History,
  user: User,
};

interface NavItemProps {
  label: string;
  path: string;
  icon: keyof typeof icons;
  active: boolean;
}

export default function NavItem({ label, path, icon: iconKey, active }: NavItemProps) {
  const Icon = icons[iconKey];

  return (
    <li>
      <Link
        to={path}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
          ${active
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    </li>
  );
}