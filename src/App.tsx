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

// Lazy-loaded pages
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
const SignupPage = React.lazy(() => import('./pages/SignupPage'));

// Protected Route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

// THIS MUST BE INSIDE THE PROVIDER TREE
const AnalyzerRoute = () => {
  const { mode } = useUserMode(); // Now safe — inside UserModeProvider
  return mode === 'professional' ? <Validator /> : <HomePage />;
};

function AppContent() {
  const { showOnboarding, setShowOnboarding } = useApp();
  const { isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public */}
          <Route
            path="/auth"
            element={
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                <AuthPage />
              </Suspense>
            }
          />
          <Route
            path="/signup"
            element={
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                <SignupPage />
              </Suspense>
            }
          />

          <Route element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
                  <AboutPage />
                </Suspense>
              }
            />

            <Route
              path="/analyzer"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8 text-center">Loading Analyzer...</div>}>
                    <AnalyzerRoute />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sentiment"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8">Loading...</div>}>
                    <SentimentPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sentiment/:type"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8">Loading...</div>}>
                    <SentimentDetail />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8">Loading History...</div>}>
                    <HistoryPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8">Loading...</div>}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8">Loading Profile...</div>}>
                    <ProfilePage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {isAdmin && (
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="p-8">Loading...</div>}>
                      <UsersPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            )}

            {isAdmin && (
              <Route
                path="/admin/config"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<div className="p-8">Loading Config...</div>}>
                      <AdminConfigPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        <Suspense fallback={null}>
          <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </Suspense>

        <Toaster position="top-right" />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default function App() {
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