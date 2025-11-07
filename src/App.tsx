// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { ModelProvider } from './contexts/ModelContext';
import { UserModeProvider } from './contexts/UserModeContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext'; // New
import AppRoutes from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider> {/* New: Wrap for session management */}
        <ThemeProvider>
          <ModelProvider>
            <UserModeProvider>
              <AppRoutes />
            </UserModeProvider>
          </ModelProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}