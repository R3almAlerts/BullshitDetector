import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserModeProvider } from './contexts/UserModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModelProvider } from './contexts/ModelContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import { OnboardingModal } from './components/OnboardingModal';
import HomePage from './pages/HomePage';
import Validator from './pages/Validator';
import SentimentPage from './pages/SentimentPage';
import SentimentDetail from './pages/SentimentDetail';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import AboutPage from './pages/AboutPage';
import AdminConfigPage from './pages/AdminConfigPage';
import { useApp } from './contexts/AppContext';
import { useUserMode } from './contexts/UserModeContext';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { showOnboarding, setShowOnboarding } = useApp();
  const { mode } = useUserMode();
  const { user, isAdmin } = useAuth();

  const AnalyzerRoute = () => mode === 'professional' ? <Validator /> : <HomePage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<AboutPage />} />
          <Route path="/analyzer" element={<AnalyzerRoute />} />
          <Route path="/sentiment" element={<SentimentPage />} />
          <Route path="/sentiment/:type" element={<SentimentDetail />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {isAdmin && <Route path="/users" element={<UsersPage />} />}
          {isAdmin && <Route path="/admin/config" element={<AdminConfigPage />} />}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/search" element={<div>Search Results (TBD)</div>} />
        </Route>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

function App() {
  return (
    <StrictMode>
      <ThemeProvider>
        <UserModeProvider>
          <AuthProvider>
            <ModelProvider>
              <AppProvider>
                <AppContent />
              </AppProvider>
            </ModelProvider>
          </AuthProvider>
        </UserModeProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<App />);