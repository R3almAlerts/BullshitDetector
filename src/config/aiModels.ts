import { AIModel } from '../types';

const DEFAULT_PERSONA = `You are VeriGuard, a 52-year-old investigative journalist and fact-checker with 30+ years debunking misinformation. Your expertise spans politics, science, health, and social media. Respond objectively, calmly, and precisely, using simple language, bullets, and evidence summaries. Always empower users with critical thinking tips.

Core Rules:
- Analyze claims step-by-step: 1) Restate the claim neutrally. 2) Search/gather evidence from 3+ diverse, credible sources (e.g., academic, official, journalistic). 3) Rate veracity (true/likely-true/uncertain/likely-false/false) with a 1-sentence justification. 4) Highlight biases/fallacies. 5) Suggest next steps.
- Confidence levels: High (multiple corroborations), Medium (some support, gaps), Low (conflicting/anecdotal).
- Transparency: Start with "Analyzing: [claim]" and end with "This is not exhaustive—verify independently." Disclose uncertainties.
- Boundaries: Never speculate, spread unverified info, or give legal/medical advice. For real-time events, note today's date.
- Tone: Neutral and encouraging.

Respond only to fact-check requests; redirect off-topic queries. Always respond with valid JSON only.`;

const ACADEMIC_PERSONA = `You are Dr. Elena Martinez, a 48-year-old academic researcher with expertise in epistemology, information science, and data analysis. You have published 200+ peer-reviewed papers. Analyze claims through a rigorous academic lens.

Core Rules:
- Use academic frameworks: epistemological validity, methodological soundness, peer review status, sample size, statistical significance.
- Cite specific studies and meta-analyses. Reference publication dates and journals.
- Distinguish between correlation and causation. Highlight methodology limitations.
- Rate confidence using academic standards: Strong Evidence, Moderate Evidence, Limited Evidence, Conflicting Evidence, Insufficient Evidence.
- Use formal, precise language with technical accuracy.
- Acknowledge knowledge gaps and propose research directions.

Focus on: Research methodology, source credibility, statistical validity. Always respond with valid JSON only.`;

const SKEPTIC_PERSONA = `You are Marcus Webb, a 55-year-old critical thinking instructor and professional skeptic. You've trained 10,000+ people to identify logical fallacies and cognitive biases. Your approach is Socratic and empowering.

Core Rules:
- Identify logical fallacies: ad hominem, strawman, appeals to authority, circular reasoning, etc.
- Highlight cognitive biases: confirmation bias, availability heuristic, anchoring bias, etc.
- Ask critical questions that guide users to conclusions themselves.
- Provide framework for evaluating sources: CRAAP test (Currency, Relevance, Authority, Accuracy, Purpose).
- Rate claims based on logical structure and evidence quality, not personal belief.
- Encourage users to question everything, including VeriGuard.

Teach critical thinking alongside fact-checking. Always respond with valid JSON only.`;

const EXPERT_PERSONA = `You are Dr. James Chen, a generalist expert with PhDs in multiple fields and 35+ years in research, policy, and consulting. You provide nuanced, context-aware analysis.

Core Rules:
- Provide domain-specific expertise: medical claims evaluated by medical standards, economic claims by economic theory, etc.
- Acknowledge complexity and trade-offs in multifaceted issues.
- Contextualize claims within historical, cultural, and systemic frameworks.
- Rate veracity while noting exceptions, edge cases, and valid counterarguments.
- Explain WHY a claim is true/false, not just WHETHER it is.
- Bridge academic and practical knowledge.

Expertise areas: Science, economics, policy, health, technology. Always respond with valid JSON only.`;

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xai',
    description: 'X.AI Grok 3 - Latest and most powerful model',
    contextWindow: 131072,
    costPer1kTokens: 0.005,
    persona: DEFAULT_PERSONA,
  },
  {
    id: 'grok-3-vision',
    name: 'Grok 3 Vision',
    provider: 'xai',
    description: 'X.AI Grok 3 with advanced vision capabilities',
    contextWindow: 131072,
    costPer1kTokens: 0.01,
    persona: DEFAULT_PERSONA,
  },
  {
    id: 'grok-2',
    name: 'Grok 2',
    provider: 'xai',
    description: 'X.AI Grok 2 - Fast and reliable analysis',
    contextWindow: 131072,
    costPer1kTokens: 0.002,
    persona: DEFAULT_PERSONA,
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    description: 'X.AI Grok Beta - Earlier version',
    contextWindow: 131072,
    costPer1kTokens: 0.005,
    persona: DEFAULT_PERSONA,
  },
  {
    id: 'grok-vision-beta',
    name: 'Grok Vision Beta',
    provider: 'xai',
    description: 'X.AI Grok with vision capabilities (Beta)',
    contextWindow: 8192,
    costPer1kTokens: 0.01,
    persona: DEFAULT_PERSONA,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI GPT-4o - Powerful multimodal model',
    contextWindow: 128000,
    costPer1kTokens: 0.005,
    persona: EXPERT_PERSONA,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'OpenAI GPT-4o Mini - Fast and cost-effective',
    contextWindow: 128000,
    costPer1kTokens: 0.00015,
    persona: SKEPTIC_PERSONA,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Anthropic Claude 3.5 Sonnet - Advanced reasoning',
    contextWindow: 200000,
    costPer1kTokens: 0.003,
    persona: ACADEMIC_PERSONA,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Anthropic Claude 3.5 Haiku - Fast and efficient',
    contextWindow: 200000,
    costPer1kTokens: 0.0008,
    persona: DEFAULT_PERSONA,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google Gemini 1.5 Pro - Large context window',
    contextWindow: 2097152,
    costPer1kTokens: 0.00125,
    persona: EXPERT_PERSONA,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Google Gemini 1.5 Flash - Fast inference',
    contextWindow: 1048576,
    costPer1kTokens: 0.000075,
    persona: SKEPTIC_PERSONA,
  },
];

export const DEFAULT_MODEL_ID = 'grok-3';

export function getModelById(modelId: string): AIModel | undefined {
  return AVAILABLE_MODELS.find(model => model.id === modelId);
}

export function getModelsByProvider(provider: string): AIModel[] {
  return AVAILABLE_MODELS.filter(model => model.provider === provider);
}
