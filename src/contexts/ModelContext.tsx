// src/contexts/ModelContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/db';

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
  const [apiKey, setApiKeyState] = useState<string>('');
  const [model, setModelState] = useState<Model>('grok-3');
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await db.get();
        setApiKeyState(data.apiKey);
        setModelState(data.model);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    })();
  }, []);

  // Save API key
  const setApiKey = async (key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    await db.setApiKey(trimmed);
    setIsValidKey(null); // Reset validation
  };

  // Save model
  const setModel = async (model: Model) => {
    setModelState(model);
    await db.setModel(model);
  };

  // Test API key with xAI
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
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        }),
      });

      setIsValidKey(response.ok);
    } catch (error) {
      console.error('API Key test failed:', error);
      setIsValidKey(false);
    }
  };

  return (
    <ModelContext.Provider
      value={{
        model,
        setModel,
        apiKey,
        setApiKey,
        isValidKey,
        testApiKey,
      }}
    >
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