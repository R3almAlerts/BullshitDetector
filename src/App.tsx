// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserModeProvider } from './contexts/UserModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModelProvider } from './contexts/ModelContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import { OnboardingModal } from './components/OnboardingModal';
import { useApp } from './contexts/AppContext';
import { useUserMode } from './contexts/UserModeContext';
import { useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded pages (perf)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Validator = React.lazy(() => import('./pages/Validator'));
const SentimentPage = React.lazy(() => import('./pages/SentimentPage'));
const SentimentDetail = React.lazy(() => import('./pages/SentimentDetail'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const AdminConfigPage = React.lazy(() => import('./pages/AdminConfigPage'));

// Protected Route Wrapper (uses useProtected)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { protected: isProtected, error } = useProtected();
  if (!isProtected) {
    if (error) toast.error(error);
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

// Dynamic Analyzer (mode-based)
const AnalyzerRoute = () => {
  const { mode } = useUserMode();
  return mode === 'professional' ? <Validator /> : <HomePage />;
};

function AppContent() {
  const { showOnboarding, setShowOnboarding } = useApp();
  const { isAdmin } = useAuth();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<AboutPage />} />
            <Route path="/auth" element={<AuthPage />} /> {/* Auth outside Layout for no-nav */}
            <Route path="/analyzer" element={<ProtectedRoute><AnalyzerRoute /></ProtectedRoute>} />
            <Route path="/sentiment" element={<ProtectedRoute><SentimentPage /></ProtectedRoute>} />
            <Route path="/sentiment/:type" element={<ProtectedRoute><SentimentDetail /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            {isAdmin && <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />}
            {isAdmin && <Route path="/admin/config" element={<ProtectedRoute><AdminConfigPage /></ProtectedRoute>} />}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/search" element={<div>Search Results (TBD)</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Suspense fallback={<div className="flex justify-center py-8">Loading...</div>}>
          <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </Suspense>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: 'var(--bg-color)', color: 'var(--text-color)' }, // Theme-aware
          }}
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function App() {
  return (
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
  );
}

export default App;