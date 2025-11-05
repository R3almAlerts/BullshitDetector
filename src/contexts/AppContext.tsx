import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  showOnboarding: boolean;
  setShowOnboarding: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(true);
  return (
    <AppContext.Provider value={{ showOnboarding, setShowOnboarding }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};