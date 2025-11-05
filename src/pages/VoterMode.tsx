import { useState } from 'react';
import { TextArea } from '../components/ui/TextArea';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { ModelSelector } from '../components/ModelSelector';
import { useApp } from '../contexts/AppContext';
import { useModel } from '../contexts/ModelContext';
import { generateMockAnalysis } from '../utils/mockAnalysis';
import { analyzeWithAI } from '../services/aiService';
import { AnalysisResult, AIModelConfig } from '../types';
import { CheckCircle2, XCircle, HelpCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { AVAILABLE_MODELS } from '../config/aiModels';

export default function VoterMode() {
  return <div className="p-8 text-2xl">Voter Mode: Simple, fast fact checks.</div>;
}

export function VoterMode() {
  const { setCurrentAnalysis, isAnalyzing, setIsAnalyzing } = useApp();
  const { getActiveConfig, configs, selectedModelId } = useModel();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 10) {
      setError('Please enter at least 10 characters');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setResult(null);

    try {
      let config: AIModelConfig | null = null;
      const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId);

      if (selectedModel) {
        const providerConfig = configs[selectedModel.provider];
        if (providerConfig?.enabled && providerConfig?.apiKey) {
          config = providerConfig;
        }
      }

      let analysis: AnalysisResult;

      if (config) {
        analysis = await analyzeWithAI(text, config, false);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        analysis = generateMockAnalysis(text);
      }

      setResult(analysis);
      setCurrentAnalysis(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const verdictConfig = {
    'true': { icon: CheckCircle2, label: 'TRUE', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    'likely-true': { icon: CheckCircle2, label: 'LIKELY TRUE', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    'uncertain': { icon: HelpCircle, label: 'UNCERTAIN', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    'likely-false': { icon: AlertTriangle, label: 'LIKELY FALSE', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    'false': { icon: XCircle, label: 'FALSE', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quick Fact Check</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">Verify claims instantly with AI-powered analysis</p>
      </div>

      <div className="space-y-4">
        <TextArea value={text} onChange={(e) => { setText(e.target.value); if (error) setError(''); }}
          placeholder="Paste a claim, news headline, or statement..." rows={6} error={error} disabled={isAnalyzing} />

        {Object.values(configs).some(c => c.enabled && c.apiKey) && (
          <ModelSelector />
        )}

        {!Object.values(configs).some(c => c.enabled && c.apiKey) && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              No AI model configured. Using mock data for demo. Configure an AI provider in Settings to use real analysis.
            </p>
          </div>
        )}

        <Button onClick={handleAnalyze} size="lg" className="w-full" isLoading={isAnalyzing}>Analyze Claim</Button>
      </div>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing...</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <Card>
          <CardHeader className={verdictConfig[result.verdict].bgColor}>
            <div className="flex items-center gap-3">
              {(() => { const Icon = verdictConfig[result.verdict].icon; return <Icon className={`w-8 h-8 ${verdictConfig[result.verdict].color}`} />; })()}
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${verdictConfig[result.verdict].color}`}>{verdictConfig[result.verdict].label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {result.confidence}%</p>
              </div>
              {result.modelUsed && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{result.modelUsed}</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Summary</h4>
              <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
            </div>

            {result.sentiment && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Sentiment</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.sentiment.positive}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Positive</div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{result.sentiment.neutral}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Neutral</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.sentiment.negative}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Negative</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
