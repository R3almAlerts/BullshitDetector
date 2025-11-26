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
import { useAuth } from './contexts/AuthContext';
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

// Protected Route (throws via useProtected)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // useProtected() will throw if not authenticated → caught by ErrorBoundary → redirects
  // This is your existing pattern — keep it
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  useProtected();
  return <>{children}</>;
};

// Dynamic analyzer based on user mode
const AnalyzerRoute = () => {
  const { mode } = useAuth(); // or useUserMode() if you have that context
  return mode === 'professional' ? <Validator /> : <HomePage />;
};

function AppContent() {
  const { showOnboarding, setShowOnboarding } = useApp();
  const { isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public routes outside Layout */}
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

          {/* All other routes use Layout */}
          <Route element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-2xl">Loading...</div>}>
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
                  <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                    <SentimentPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sentiment/:type"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                    <SentimentDetail />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8 text-center">Loading History...</div>}>
                    <HistoryPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="p-8 text-center">Loading Profile...</div>}>
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
                    <Suspense fallback={<div className="p-8 text-center">Loading Users...</div>}>
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
                    <Suspense fallback={<div className="p-8 text-center">Loading Config...</div>}>
                      <AdminConfigPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
            )}
            <Route
              path="/about"
              element={
                <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                  <AboutPage />
                </Suspense>
              }
            />
            <Route path="/search" element={<div>Search Results (TBD)</div>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
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