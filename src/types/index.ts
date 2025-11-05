export type UserMode = 'voter' | 'professional';
export type ThemeMode = 'light' | 'dark';
export type VerdictLevel = 'true' | 'likely-true' | 'uncertain' | 'likely-false' | 'false';
export type SentimentType = 'positive' | 'neutral' | 'negative';

export type AIProvider = 'xai' | 'openai' | 'anthropic' | 'google' | 'custom';

// src/contexts/index.ts
import { createContext, type ReactNode } from 'react';

export { createContext };
export type { ReactNode };

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextWindow: number;
  costPer1kTokens: number;
  persona: string;
}

export interface AIModelConfig {
  provider: AIProvider;
  modelId: string;
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  persona?: string;
}

export interface AnalysisResult {
  id: string;
  content: string;
  verdict: VerdictLevel;
  confidence: number;
  summary: string;
  keyPoints: string[];
  biasScore?: number;
  biasDirection?: string;
  sentiment?: SentimentAnalysis;
  createdAt: string;
  modelUsed?: string;
}

export interface SentimentAnalysis {
  overall: SentimentType;
  positive: number;
  neutral: number;
  negative: number;
}
