// src/components/layout/Layout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import NavigationMenu from './NavigationMenu';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect root index (when Layout is mounted) to /validator if authenticated
  useEffect(() => {
    if (location.pathname === '/' && location.pathname === location.pathname) {
      // Let AboutPage render on root; do nothing
    }
  }, [location]);

  // Show navigation on ALL pages EXCEPT /splash
  const showNavigation = location.pathname !== '/splash';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {showNavigation && <NavigationMenu />}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}