import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserMode } from '../types';

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UserMode>(() => {
    const saved = localStorage.getItem('userMode');
    return (saved === 'voter' || saved === 'professional') ? saved : 'voter';
  });

  useEffect(() => {
    localStorage.setItem('userMode', mode);
  }, [mode]);

  const setMode = (newMode: UserMode) => {
    setModeState(newMode);
  };

  return (
    <UserModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (!context) throw new Error('useUserMode must be used within UserModeProvider');
  return context;
}
