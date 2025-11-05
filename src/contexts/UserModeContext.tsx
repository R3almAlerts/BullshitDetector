import { createContext, useContext, useState, ReactNode } from 'react';

type Mode = 'voter' | 'professional';

interface UserModeContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('voter');
  return (
    <UserModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export const useUserMode = () => {
  const ctx = useContext(UserModeContext);
  if (!ctx) throw new Error('useUserMode must be used within UserModeProvider');
  return ctx;
};