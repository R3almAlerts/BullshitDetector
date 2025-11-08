// src/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import SentimentPage from './pages/SentimentPage';
import SentimentDetail from './pages/SentimentDetail';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage'; // New
import Layout from './components/layout/Layout';
import { useProtected } from './contexts/AuthContext'; // New import

// Admin guard component
function AdminRoute({ children }: { children: JSX.Element }) {
  try {
    useProtected();
    return children;
  } catch {
    return <Navigate to="/splash" replace />;
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route element={<Layout />}>
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