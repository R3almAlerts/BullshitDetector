import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  showOnboarding: boolean;
  setShowOnboarding: (value: boolean) => void;
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

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};