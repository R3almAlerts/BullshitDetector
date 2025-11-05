import { AIModelConfig, AnalysisResult, VerdictLevel } from '../types';
import { getModelById } from '../config/aiModels';

interface AnalysisResponse {
  verdict: VerdictLevel;
  confidence: number;
  summary: string;
  keyPoints: string[];
  biasScore?: number;
  biasDirection?: string;
  sentiment?: {
    overall: 'positive' | 'neutral' | 'negative';
    positive: number;
    neutral: number;
    negative: number;
  };
}

export async function analyzeWithAI(
  content: string,
  config: AIModelConfig,
  useEdgeFunction: boolean = true
): Promise<AnalysisResult> {
  const model = getModelById(config.modelId);

  if (!config.apiKey || !config.apiKey.trim()) {
    throw new Error('API key not configured');
  }

  let response: AnalysisResponse;

  try {
    if (useEdgeFunction) {
      response = await callViaEdgeFunction(content, config);
    } else {
      response = await callDirectAPI(content, config);
    }
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze content');
  }

  return {
    id: crypto.randomUUID(),
    content,
    verdict: response.verdict,
    confidence: response.confidence,
    summary: response.summary,
    keyPoints: response.keyPoints,
    biasScore: response.biasScore,
    biasDirection: response.biasDirection,
    sentiment: response.sentiment,
    createdAt: new Date().toISOString(),
    modelUsed: model?.name || config.modelId,
  };
}

async function callViaEdgeFunction(
  claim: string,
  config: AIModelConfig
): Promise<AnalysisResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment not configured');
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/analyze-claim`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        claim,
        provider: config.provider,
        modelId: config.modelId,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

async function callDirectAPI(
  content: string,
  config: AIModelConfig
): Promise<AnalysisResponse> {
  const model = getModelById(config.modelId);
  const personaInstructions = config.persona || model?.persona || '';

  const prompt = `${personaInstructions}

Analyze the following claim and provide:
1. A verdict (true, likely-true, uncertain, likely-false, or false)
2. Confidence level (0-100)
3. A brief summary of your analysis
4. Key points supporting your verdict
5. Bias score (-100 to +100, where negative is left-leaning and positive is right-leaning)
6. Bias direction (left-leaning, right-leaning, or neutral)
7. Sentiment analysis (positive, neutral, negative percentages)

Claim to analyze: ${content}

Respond in JSON format with the following structure:
{
  "verdict": "true|likely-true|uncertain|likely-false|false",
  "confidence": 85,
  "summary": "Brief summary of the analysis",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "biasScore": -15,
  "biasDirection": "left-leaning",
  "sentiment": {
    "overall": "negative",
    "positive": 20,
    "neutral": 30,
    "negative": 50
  }
}`;

  if (config.provider === 'xai' || config.provider === 'openai') {
    return callOpenAICompatibleAPI(prompt, config);
  } else if (config.provider === 'anthropic') {
    return callAnthropicAPI(prompt, config);
  } else if (config.provider === 'google') {
    return callGoogleAPI(prompt, config);
  } else {
    throw new Error(`Provider ${config.provider} not supported`);
  }
}

async function callOpenAICompatibleAPI(
  prompt: string,
  config: AIModelConfig
): Promise<AnalysisResponse> {
  const baseUrl = config.baseUrl || (config.provider === 'xai' ? 'https://api.x.ai/v1' : 'https://api.openai.com/v1');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.modelId,
      messages: [
        {
          role: 'system',
          content: 'You are a fact-checking AI. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('No content in response');

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not extract JSON from response');
    return JSON.parse(jsonMatch[0]);
  }
}

async function callAnthropicAPI(
  prompt: string,
  config: AIModelConfig
): Promise<AnalysisResponse> {
  const baseUrl = config.baseUrl || 'https://api.anthropic.com';

  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.modelId,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response format');
  return JSON.parse(jsonMatch[0]);
}

async function callGoogleAPI(
  prompt: string,
  config: AIModelConfig
): Promise<AnalysisResponse> {
  const baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/';

  const response = await fetch(
    `${baseUrl}models/${config.modelId}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response format');
  return JSON.parse(jsonMatch[0]);
}
