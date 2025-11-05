// src/lib/db.ts
interface DB {
  apiKey: string;
  model: 'grok-3' | 'grok-4';
}

const DEFAULT_DB: DB = {
  apiKey: '',
  model: 'grok-3',
};

const DB_KEY = 'bullshit-detector-db';

export const db = {
  /**
   * Load settings from localStorage
   */
  async get(): Promise<DB> {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return { ...DEFAULT_DB };
      const parsed = JSON.parse(raw);
      return {
        apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : DEFAULT_DB.apiKey,
        model: parsed.model === 'grok-4' ? 'grok-4' : DEFAULT_DB.model,
      };
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return { ...DEFAULT_DB };
    }
  },

  /**
   * Save API key
   */
  async setApiKey(key: string): Promise<void> {
    try {
      const current = await db.get();
      localStorage.setItem(DB_KEY, JSON.stringify({ ...current, apiKey: key.trim() }));
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  },

  /**
   * Save model selection
   */
  async setModel(model: 'grok-3' | 'grok-4'): Promise<void> {
    try {
      const current = await db.get();
      localStorage.setItem(DB_KEY, JSON.stringify({ ...current, model }));
    } catch (error) {
      console.error('Failed to save model:', error);
    }
  },
};