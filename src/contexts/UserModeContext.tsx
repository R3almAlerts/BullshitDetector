import { createContext, useContext, useState, ReactNode } from 'react';

type UserMode = 'voter' | 'professional';

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<UserMode>('voter');

  return (
    <UserModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export const useUserMode = (): UserModeContextType => {
  const context = useContext(UserModeContext);
  if (!context) {
    throw new Error('useUserMode must be used within UserModeProvider');
  }
  return context;
};