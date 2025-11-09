// src/components/layout/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';

export default function Layout() {
  const location = useLocation();
  const showNav = !['/', '/splash'].includes(location.pathname) || location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {showNav && <NavigationMenu />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}