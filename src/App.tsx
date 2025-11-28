// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserModeProvider, useUserMode } from './contexts/UserModeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModelProvider } from './contexts/ModelContext';
import { AppProvider, useApp } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import { OnboardingModal } from './components/OnboardingModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded pages — ALL must be default exports in their files!
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Validator = React.lazy(() => import('./pages/Validator'));
const SentimentPage = React.lazy(() => import('./pages/SentimentPage'));
const SentimentDetail = React.lazy(() => import('./pages/SentimentDetail'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AdminConfigPage = React.lazy(() => import('./pages/AdminConfigPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));

// Safe loading fallback component
const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-xl font-medium text-gray-600 dark:text-gray-400">Loading...</div>
  </div>
);

// Protected route — never throws
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

// Analyzer route — safely reads context
const AnalyzerRoute = () => {
  const { mode = 'voter' } = useUserMode();
  return mode === 'professional' ? <Validator /> : <HomePage />;
};

// Main app content (inside all providers)
const AppContent = () => {
  const { showOnboarding, setShowOnboarding } = useApp();
  const { isAdmin } = useAuth();

  return (
    <>
      <Routes>
        {/* Public */}
        <Route
          path="/auth"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AuthPage />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SignupPage />
            </Suspense>
          }
        />

        {/* Protected app with Layout */}
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AboutPage />
              </Suspense>
            }
          />

          <Route
            path="/analyzer"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <AnalyzerRoute />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sentiment"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <SentimentPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sentiment/:type"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <SentimentDetail />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <HistoryPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <ProfilePage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {isAdmin && (
            <Route
              path="/admin/config"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminConfigPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          )}

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Onboarding modal — outside Routes so it can overlay everything */}
      <Suspense fallback={null}>
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      </Suspense>

      <Toaster position="top-right" />
    </>
  );
};

export default function App() {
  return (
    <React.StrictMode>
      <ThemeProvider>
        <UserModeProvider>
          <AuthProvider>
            <ModelProvider>
              <AppProvider>
                <BrowserRouter>
                  <ErrorBoundary>
                    <AppContent />
                  </ErrorBoundary>
                </BrowserRouter>
              </AppProvider>
            </ModelProvider>
          </AuthProvider>
        </UserModeProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}