import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  currentPath: string;
}

const nav = [
  { label: 'Home', path: '/' },
  { label: 'Analyzer', path: '/analyzer' },
  { label: 'Sentiment', path: '/sentiment' },
  { label: 'History', path: '/history' },
  { label: 'Settings', path: '/settings' },
];

export function AppLayout({ children, currentPath }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white dark:bg-gray-800">
        <nav className="container mx-auto flex gap-2 p-4">
          {nav.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`rounded px-4 py-2 transition-colors ${
                currentPath === path
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-current={currentPath === path ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 container mx-auto p-6">{children}</main>
      <footer className="border-t bg-white py-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        © {new Date().getFullYear()} Bullshit Detector
      </footer>
    </div>
  );
}