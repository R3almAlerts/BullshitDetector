import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  claim: string;
  provider: string;
  modelId: string;
  apiKey: string;
  baseUrl?: string;
}

interface AnalysisResponse {
  verdict: "true" | "likely-true" | "uncertain" | "likely-false" | "false";
  confidence: number;
  summary: string;
  keyPoints: string[];
  biasScore?: number;
  biasDirection?: string;
  sentiment?: {
    overall: "positive" | "neutral" | "negative";
    positive: number;
    neutral: number;
    negative: number;
  };
}

const ANALYSIS_PROMPT = `You are a fact-checking AI assistant. Analyze the following claim and provide:
1. A verdict (true, likely-true, uncertain, likely-false, or false)
2. Confidence level (0-100)
3. A brief summary of your analysis
4. Key points supporting your verdict
5. Bias score (-100 to +100, where negative is left-leaning and positive is right-leaning)
6. Bias direction (left-leaning, right-leaning, or neutral)
7. Sentiment analysis (positive, neutral, negative percentages)

Claim to analyze: {claim}

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

async function callOpenAICompatibleAPI(
  prompt: string,
  modelId: string,
  apiKey: string,
  baseUrl: string
): Promise<AnalysisResponse> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: "system",
          content:
            "You are a fact-checking AI. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

async function callAnthropicAPI(
  prompt: string,
  modelId: string,
  apiKey: string,
  baseUrl: string
): Promise<AnalysisResponse> {
  const response = await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
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
  if (!jsonMatch) throw new Error("Invalid response format");
  return JSON.parse(jsonMatch[0]);
}

async function callGoogleAPI(
  prompt: string,
  modelId: string,
  apiKey: string,
  baseUrl: string
): Promise<AnalysisResponse> {
  const response = await fetch(
    `${baseUrl}/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  if (!jsonMatch) throw new Error("Invalid response format");
  return JSON.parse(jsonMatch[0]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { claim, provider, modelId, apiKey, baseUrl } =
      (await req.json()) as AnalysisRequest;

    if (!claim || !provider || !modelId || !apiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: claim, provider, modelId, apiKey",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = ANALYSIS_PROMPT.replace("{claim}", claim);

    let response: AnalysisResponse;

    if (provider === "xai" || provider === "openai") {
      const url =
        baseUrl ||
        (provider === "xai"
          ? "https://api.x.ai/v1"
          : "https://api.openai.com/v1");
      response = await callOpenAICompatibleAPI(prompt, modelId, apiKey, url);
    } else if (provider === "anthropic") {
      const url = baseUrl || "https://api.anthropic.com";
      response = await callAnthropicAPI(prompt, modelId, apiKey, url);
    } else if (provider === "google") {
      const url =
        baseUrl || "https://generativelanguage.googleapis.com/v1beta/openai/";
      response = await callGoogleAPI(prompt, modelId, apiKey, url);
    } else {
      throw new Error(`Provider ${provider} not supported`);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Analysis error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
