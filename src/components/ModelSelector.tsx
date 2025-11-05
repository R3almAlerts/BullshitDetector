import { AVAILABLE_MODELS, getModelsByProvider } from '../config/aiModels';
import { useModel } from '../contexts/ModelContext';
import { AIProvider } from '../types';

interface ModelSelectorProps {
  onModelChange?: (modelId: string) => void;
}

export function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const { selectedModelId, setSelectedModelId, configs } = useModel();

  const enabledProviders = Object.entries(configs)
    .filter(([_, config]) => config.enabled && config.apiKey)
    .map(([provider]) => provider as AIProvider);

  const availableModels = enabledProviders.length > 0
    ? AVAILABLE_MODELS.filter(m => enabledProviders.includes(m.provider as AIProvider))
    : AVAILABLE_MODELS;

  const handleChange = (modelId: string) => {
    setSelectedModelId(modelId);
    onModelChange?.(modelId);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        AI Model
      </label>
      <select
        value={selectedModelId}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
      >
        {availableModels.map(model => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider.toUpperCase()}) - ${model.costPer1kTokens}/1k tokens
          </option>
        ))}
      </select>

      {enabledProviders.length === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          No AI providers configured. Please set up at least one in Settings.
        </p>
      )}
    </div>
  );
}
