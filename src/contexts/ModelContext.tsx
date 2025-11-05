// src/contexts/ModelContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type Model = 'grok-3' | 'grok-4';

interface ModelContextType {
  model: Model;
  setModel: (model: Model) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  isValidKey: boolean | null;
  testApiKey: () => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [model, setModel] = useState<Model>('grok-3');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('xai-api-key') || '');
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);

  const testApiKey = async () => {
    if (!apiKey) {
      setIsValidKey(false);
      return;
    }

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say hello' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        setIsValidKey(true);
        localStorage.setItem('xai-api-key', apiKey);
      } else {
        setIsValidKey(false);
      }
    } catch (error) {
      console.error('API Key test failed:', error);
      setIsValidKey(false);
    }
  };

  return (
    <ModelContext.Provider value={{ model, setModel, apiKey, setApiKey, isValidKey, testApiKey }}>
      {children}
    </ModelContext.Provider>
  );
}

export const useModel = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (!context) throw new Error('useModel must be used within ModelProvider');
  return context;
};