// src/contexts/ModelContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type Model = 'grok' | 'gpt-4' | 'claude';

interface ModelContextType {
  model: Model;
  setModel: (model: Model) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  // useState is now properly imported
  const [model, setModel] = useState<Model>('grok');

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within ModelProvider');
  }
  return context;
};