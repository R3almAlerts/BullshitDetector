import { AnalysisResult, VerdictLevel } from '../types';

export function generateMockAnalysis(content: string): AnalysisResult {
  const verdicts: VerdictLevel[] = ['true', 'likely-true', 'uncertain', 'likely-false', 'false'];
  const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
  const confidence = Math.floor(Math.random() * 30) + 65;

  const summaries = {
    'true': 'This claim is supported by credible sources and verified evidence.',
    'likely-true': 'This claim appears to be accurate based on available evidence.',
    'uncertain': 'There is insufficient evidence to determine the accuracy of this claim.',
    'likely-false': 'This claim appears to be inaccurate based on available evidence.',
    'false': 'This claim is contradicted by credible sources and verified evidence.',
  };

  const keyPoints = [
    'Multiple credible sources have been cross-referenced',
    'The claim contains verifiable factual assertions',
    'Context and timing of the statement have been considered',
  ];

  return {
    id: crypto.randomUUID(),
    content,
    verdict: randomVerdict,
    confidence,
    summary: summaries[randomVerdict],
    keyPoints,
    biasScore: Math.random() > 0.5 ? Math.floor(Math.random() * 40) - 20 : undefined,
    biasDirection: Math.random() > 0.5 ? 'left-leaning' : 'right-leaning',
    sentiment: {
      overall: randomVerdict === 'false' ? 'negative' : randomVerdict === 'true' ? 'positive' : 'neutral',
      positive: Math.floor(Math.random() * 40) + 20,
      neutral: Math.floor(Math.random() * 40) + 20,
      negative: Math.floor(Math.random() * 40) + 20,
    },
    createdAt: new Date().toISOString(),
  };
}
