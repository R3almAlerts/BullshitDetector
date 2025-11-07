// src/components/layout/Layout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">Bullshit Detector</h1>
            </div>
            <nav className="flex space-x-1">
              <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                Home
              </NavLink>
              <NavLink to="/sentiment" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                Sentiment
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                History
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                Settings
              </NavLink>
            </nav>
            <div className="flex items-center">
              {user ? (
                <div className="relative">
                  <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.email}&background=6C7280`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">{user.email}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                    <NavLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</NavLink>
                    <NavLink to="/admin-config" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Admin Config</NavLink>
                    <button
                      onClick={signOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <NavLink to="/auth" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Sign In
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="mt-16 text-center text-xs text-gray-500 dark:text-gray-400 pb-8">
        <p>
          Built with ❤️ and xAI Grok
        </p>
      </footer>
    </div>
  );
}