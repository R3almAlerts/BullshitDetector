import { Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserModeProvider, useUserMode } from './contexts/UserModeContext';
import { ModelProvider } from './contexts/ModelContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { OnboardingModal } from './components/OnboardingModal';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Lazy load pages with default export
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.default })));
const VoterMode = lazy(() => import('./pages/VoterMode').then(m => ({ default: m.default })));
const ProfessionalMode = lazy(() => import('./pages/ProfessionalMode').then(m => ({ default: m.default })));
const SentimentPage = lazy(() => import('./pages/SentimentPage').then(m => ({ default: m.default })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then(m => ({ default: m.default })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.default })));

function AppContent() {
  const { showOnboarding, setShowOnboarding } = useApp();
  const { mode } = useUserMode();
  const location = useLocation();

  return (
    <>
      <AppLayout currentPath={location.pathname}>
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/analyzer"
              element={mode === 'professional' ? <ProfessionalMode /> : <VoterMode />}
            />
            <Route path="/sentiment" element={<SentimentPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>

      <OnboardingModal
        key="onboarding"
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserModeProvider>
        <AuthProvider>
          <ModelProvider>
            <AppProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </AppProvider>
          </ModelProvider>
        </AuthProvider>
      </UserModeProvider>
    </ThemeProvider>
  );
}