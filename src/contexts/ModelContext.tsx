import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AIModelConfig } from '../types';
import { DEFAULT_MODEL_ID } from '../config/aiModels';
import { supabase } from '../lib/supabase';

// src/contexts/ModelContext.tsx
import { createContext, ReactNode } from 'react';
export const ModelContext = createContext<any>(null);
export function ModelProvider({ children }: { children: ReactNode }) {
  return <ModelContext.Provider value={{ model: 'grok' }}>{children}</ModelContext.Provider>;
}


interface ModelContextType {
  configs: Record<string, AIModelConfig>;
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
  updateConfig: (provider: string, config: Partial<AIModelConfig>) => void;
  getActiveConfig: () => AIModelConfig | null;
  isSyncing: boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

const DEFAULT_CONFIGS: Record<string, AIModelConfig> = {
  xai: {
    provider: 'xai',
    modelId: 'grok-3',
    apiKey: '',
    baseUrl: 'https://api.x.ai/v1',
    enabled: false,
  },
  openai: {
    provider: 'openai',
    modelId: 'gpt-4o-mini',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    enabled: false,
  },
  anthropic: {
    provider: 'anthropic',
    modelId: 'claude-3-5-haiku-20241022',
    apiKey: '',
    baseUrl: 'https://api.anthropic.com/v1',
    enabled: false,
  },
  google: {
    provider: 'google',
    modelId: 'gemini-1.5-flash',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    enabled: false,
  },
};

export function ModelProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, AIModelConfig>>(() => {
    const saved = localStorage.getItem('aiModelConfigs');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIGS;
  });

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    return localStorage.getItem('selectedModelId') || DEFAULT_MODEL_ID;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user?.id) {
        loadConfigsFromSupabase(user.id);
      }
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      if (newUserId) {
        loadConfigsFromSupabase(newUserId);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadConfigsFromSupabase = async (uid: string) => {
    if (!supabase) return;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('ai_model_configs')
        .select('*')
        .eq('user_id', uid);

      if (error) throw error;

      if (data && data.length > 0) {
        const newConfigs: Record<string, AIModelConfig> = { ...DEFAULT_CONFIGS };

        data.forEach(row => {
          if (row.provider in newConfigs) {
            newConfigs[row.provider] = {
              provider: row.provider,
              modelId: row.model_id,
              apiKey: row.api_key || '',
              baseUrl: row.base_url,
              enabled: row.enabled,
              persona: row.persona,
            };
          }
        });

        setConfigs(newConfigs);
        localStorage.setItem('aiModelConfigs', JSON.stringify(newConfigs));
      }

      const { data: selection } = await supabase
        .from('user_model_selection')
        .select('selected_model_id')
        .eq('user_id', uid)
        .maybeSingle();

      if (selection?.selected_model_id) {
        setSelectedModelId(selection.selected_model_id);
        localStorage.setItem('selectedModelId', selection.selected_model_id);
      }
    } catch (error) {
      console.error('Failed to load configs from Supabase:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveConfigToSupabase = async (provider: string, config: AIModelConfig) => {
    if (!supabase || !userId) {
      localStorage.setItem('aiModelConfigs', JSON.stringify(configs));
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_model_configs')
        .upsert({
          user_id: userId,
          provider: config.provider,
          model_id: config.modelId,
          api_key: config.apiKey,
          base_url: config.baseUrl,
          persona: config.persona,
          enabled: config.enabled,
        }, {
          onConflict: 'user_id,provider'
        });

      if (error) throw error;
      localStorage.setItem('aiModelConfigs', JSON.stringify(configs));
    } catch (error) {
      console.error('Failed to save config to Supabase:', error);
      localStorage.setItem('aiModelConfigs', JSON.stringify(configs));
    }
  };

  const saveModelSelectionToSupabase = async (modelId: string) => {
    if (!supabase || !userId) {
      localStorage.setItem('selectedModelId', modelId);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_model_selection')
        .upsert({
          user_id: userId,
          selected_model_id: modelId,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      localStorage.setItem('selectedModelId', modelId);
    } catch (error) {
      console.error('Failed to save model selection to Supabase:', error);
      localStorage.setItem('selectedModelId', modelId);
    }
  };

  const handleSetSelectedModelId = (modelId: string) => {
    setSelectedModelId(modelId);
    saveModelSelectionToSupabase(modelId);
  };

  const updateConfig = (provider: string, configUpdate: Partial<AIModelConfig>) => {
    setConfigs(prev => {
      const updatedConfig = {
        ...prev[provider],
        ...configUpdate,
      };

      const newConfigs = {
        ...prev,
        [provider]: updatedConfig,
      };

      saveConfigToSupabase(provider, updatedConfig);
      return newConfigs;
    });
  };

  const getActiveConfig = (): AIModelConfig | null => {
    const config = Object.values(configs).find(c =>
      c.enabled && c.apiKey.trim() !== ''
    );
    return config || null;
  };

  return (
    <ModelContext.Provider value={{
      configs,
      selectedModelId,
      setSelectedModelId: handleSetSelectedModelId,
      updateConfig,
      getActiveConfig,
      isSyncing,
    }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) throw new Error('useModel must be used within ModelProvider');
  return context;
}
