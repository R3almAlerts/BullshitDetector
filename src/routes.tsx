// src/routes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import SplashPage from './pages/SplashPage';
import SentimentPage from './pages/SentimentPage';
import SentimentDetail from './pages/SentimentDetail';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import Validator from './pages/Validator';
import Layout from './components/layout/Layout';
import { useProtected } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: JSX.Element }) {
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
      {/* All routes nested under Layout for consistent navigation */}
      <Route element={<Layout />}>
        {/* Public landing: AboutPage with nav */}
        <Route path="/" element={<AboutPage />} />
        {/* Login screen: SplashPage (nav hidden via Layout logic) */}
        <Route path="/splash" element={<SplashPage />} />
        {/* Protected routes */}
        <Route
          path="/validator"
          element={
            <ProtectedRoute>
              <Validator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentiment"
          element={
            <ProtectedRoute>
              <SentimentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentiment/:type"
          element={
            <ProtectedRoute>
              <SentimentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all: redirect to splash for unknown paths */}
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}