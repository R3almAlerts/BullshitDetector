import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { useTheme } from '../contexts/ThemeContext';
import { useUserMode } from '../contexts/UserModeContext';
import { useModel } from '../contexts/ModelContext';
import { AVAILABLE_MODELS, getModelsByProvider } from '../config/aiModels';
import { AIProvider } from '../types';
import { Sun, Zap, Bell, Save, Brain, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

// src/pages/SettingsPage.tsx
export default function SettingsPage() {
  return <div className="p-8 text-2xl">Settings & Preferences</div>;
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { mode, setMode } = useUserMode();
  const { configs, selectedModelId, setSelectedModelId, updateConfig } = useModel();
  const [notifications, setNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [expandedPersonas, setExpandedPersonas] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const togglePersonaExpanded = (modelId: string) => {
    setExpandedPersonas(prev => ({ ...prev, [modelId]: !prev[modelId] }));
  };

  const providers: { id: AIProvider; name: string; description: string }[] = [
    { id: 'xai', name: 'X.AI (Grok)', description: 'Fast and accurate analysis with Grok models' },
    { id: 'openai', name: 'OpenAI', description: 'GPT-4 and other OpenAI models' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude models for advanced reasoning' },
    { id: 'google', name: 'Google AI', description: 'Gemini models with large context' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Customize your experience</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</p>
            </div>
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Mode</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Professional Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access advanced features</p>
            </div>
            <Toggle checked={mode === 'professional'} onChange={(checked) => setMode(checked ? 'professional' : 'voter')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Model Configuration</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure AI providers for analysis. At least one provider must be enabled.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {providers.map(provider => {
            const config = configs[provider.id];
            const providerModels = getModelsByProvider(provider.id);
            const isVisible = showApiKeys[provider.id];

            return (
              <div key={provider.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{provider.name}</h4>
                      {config?.enabled && config?.apiKey && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{provider.description}</p>
                  </div>
                  <Toggle
                    checked={config?.enabled || false}
                    onChange={(checked) => updateConfig(provider.id, { enabled: checked })}
                  />
                </div>

                {config?.enabled && (
                  <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Model
                      </label>
                      <select
                        value={config.modelId}
                        onChange={(e) => {
                          updateConfig(provider.id, { modelId: e.target.value });
                          const selectedModel = AVAILABLE_MODELS.find(m => m.id === e.target.value);
                          if (selectedModel) {
                            updateConfig(provider.id, { persona: selectedModel.persona });
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {providerModels.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} - ${model.costPer1kTokens}/1k tokens
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <Input
                        type={isVisible ? 'text' : 'password'}
                        label="API Key"
                        value={config.apiKey}
                        onChange={(e) => updateConfig(provider.id, { apiKey: e.target.value })}
                        placeholder={`Enter your ${provider.name} API key`}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKeyVisibility(provider.id)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {config.baseUrl && (
                      <Input
                        label="Base URL (Optional)"
                        value={config.baseUrl}
                        onChange={(e) => updateConfig(provider.id, { baseUrl: e.target.value })}
                        placeholder="https://api.example.com/v1"
                        helperText="Override the default API endpoint"
                      />
                    )}

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => togglePersonaExpanded(config.modelId)}
                        className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Persona Instructions</span>
                        {expandedPersonas[config.modelId] ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {expandedPersonas[config.modelId] && (
                        <div className="mt-2">
                          <TextArea
                            label="Custom Persona (Optional)"
                            value={config.persona || ''}
                            onChange={(e) => updateConfig(provider.id, { persona: e.target.value })}
                            placeholder="Leave empty to use the default persona for this model"
                            rows={6}
                            helperText="Customize how the AI analyzes claims"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Click Save to apply custom persona changes.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Model for Analysis
            </label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider.toUpperCase()})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This model will be used by default unless overridden in Professional Mode
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Preferences</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates</p>
            </div>
            <Toggle checked={notifications} onChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Auto-save</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Save analyses automatically</p>
            </div>
            <Toggle checked={autoSave} onChange={setAutoSave} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />{saved ? 'Saved!' : 'Save'}</Button>
      </div>
    </div>
  );
}
