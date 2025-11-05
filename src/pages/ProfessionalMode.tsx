import { useState } from 'react';
import { TextArea } from '../components/ui/TextArea';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ModelSelector } from '../components/ModelSelector';
import { useApp } from '../contexts/AppContext';
import { useModel } from '../contexts/ModelContext';
import { generateMockAnalysis } from '../utils/mockAnalysis';
import { analyzeWithAI } from '../services/aiService';
import { AnalysisResult, AIModelConfig } from '../types';
import { FileText, Link as LinkIcon, Upload, Download, Share2, AlertCircle } from 'lucide-react';
import { AVAILABLE_MODELS } from '../config/aiModels';

export function ProfessionalMode() {
  const { setCurrentAnalysis, isAnalyzing, setIsAnalyzing } = useApp();
  const { configs, selectedModelId } = useModel();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'batch'>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setError('');
    if (activeTab === 'text' && (!text.trim() || text.trim().length < 10)) {
      setError('Please enter at least 10 characters');
      return;
    }
    if (activeTab === 'url' && !url.trim()) {
      setError('Please enter a URL');
      return;
    }

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

      const content = activeTab === 'text' ? text : url;
      let analysis: AnalysisResult;

      if (config) {
        analysis = await analyzeWithAI(content, config, false);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2500));
        analysis = generateMockAnalysis(content);
      }

      setResult(analysis);
      setCurrentAnalysis(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const tabs = [
    { id: 'text' as const, label: 'Text', icon: FileText },
    { id: 'url' as const, label: 'URL', icon: LinkIcon },
    { id: 'batch' as const, label: 'Batch', icon: Upload },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Professional Dashboard</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Advanced analysis tools</p>
        </div>
        {result && (
          <div className="flex gap-2">
            <Button variant="secondary"><Share2 className="w-4 h-4 mr-2" />Share</Button>
            <Button variant="secondary"><Download className="w-4 h-4 mr-2" />Export</Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(''); }}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 dark:text-gray-400'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {activeTab === 'text' && (
              <TextArea value={text} onChange={(e) => { setText(e.target.value); if (error) setError(''); }}
                placeholder="Enter text for analysis..." rows={8} error={error} disabled={isAnalyzing} />
            )}

            {activeTab === 'url' && (
              <Input type="url" value={url} onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
                placeholder="https://example.com/article" error={error} disabled={isAnalyzing} />
            )}

            {activeTab === 'batch' && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Feature coming soon</p>
              </div>
            )}

            {Object.values(configs).some(c => c.enabled && c.apiKey) && activeTab !== 'batch' && (
              <ModelSelector />
            )}

            {!Object.values(configs).some(c => c.enabled && c.apiKey) && activeTab !== 'batch' && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  No AI model configured. Using mock data for demo. Configure an AI provider in Settings to use real analysis.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleAnalyze} size="lg" isLoading={isAnalyzing} disabled={activeTab === 'batch'}>
                Run Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <div className="flex flex-col items-center py-12 space-y-4">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-900 dark:text-gray-100 font-medium">Running analysis...</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Verdict: {result.verdict.toUpperCase().replace('-', ' ')}</h3>
                {result.modelUsed && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyzed by {result.modelUsed}</p>
                )}
              </div>
              <Badge variant={result.verdict}>{result.confidence}% Confidence</Badge>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg">{result.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
