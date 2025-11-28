// src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}