// src/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AboutPage from './pages/AboutPage'; // Landing
import SplashPage from './pages/SplashPage'; // Legacy
import SentimentPage from './pages/SentimentPage';
import SentimentDetail from './pages/SentimentDetail';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import Validator from './pages/Validator';
import Layout from './components/layout/Layout';
import { useProtected } from './contexts/AuthContext';

// Admin guard
function AdminRoute({ children }: { children: JSX.Element }) {
  try {
    useProtected();
    return children;
  } catch {
    return <Navigate to="/" replace />;
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AboutPage />} /> {/* Unprotected landing - About */}
      <Route path="/splash" element={<SplashPage />} /> {/* Legacy */}
      <Route element={<Layout />}>
        <Route index element={<Validator />} /> {/* Protected default to Validator */}
        <Route path="/validator" element={<Validator />} />
        <Route path="/sentiment" element={<SentimentPage />} />
        <Route path="/sentiment/:type" element={<SentimentDetail />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}