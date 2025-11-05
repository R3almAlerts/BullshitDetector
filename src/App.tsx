import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserModeProvider } from './contexts/UserModeContext';
import { ModelProvider } from './contexts/ModelContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { OnboardingModal } from './components/OnboardingModal';
import { HomePage } from './pages/HomePage';
import { VoterMode } from './pages/VoterMode';
import { ProfessionalMode } from './pages/ProfessionalMode';
import { HistoryPage } from './pages/HistoryPage';
import { SentimentPage } from './pages/SentimentPage';
import { SettingsPage } from './pages/SettingsPage';
import { useUserMode } from './contexts/UserModeContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { showOnboarding, setShowOnboarding } = useApp();
  const { mode } = useUserMode();

  const renderPage = () => {
    if (currentPage === 'home') return <HomePage onNavigate={setCurrentPage} />;
    if (currentPage === 'analyzer') return mode === 'professional' ? <ProfessionalMode /> : <VoterMode />;
    if (currentPage === 'sentiment') return <SentimentPage />;
    if (currentPage === 'history') return <HistoryPage />;
    if (currentPage === 'settings') return <SettingsPage />;
    return <HomePage onNavigate={setCurrentPage} />;
  };

  return (
    <>
      <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppLayout>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </>
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
