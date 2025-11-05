// src/pages/SettingsPage.tsx
import { useTheme } from '../contexts/ThemeContext';
import { useUserMode } from '../contexts/UserModeContext';
import { useModel } from '../contexts/ModelContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { mode, setMode } = useUserMode();
  const { model, setModel, apiKey, setApiKey, isValidKey, testApiKey } = useModel();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Customize your Bullshit Detector experience.
      </p>

      <div className="space-y-8">
        {/* Theme */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toggle between light and dark themes.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* User Mode */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Analysis Mode</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Voter Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Simple, fast verdicts for everyday use.
                </p>
              </div>
              <input
                type="radio"
                name="mode"
                checked={mode === 'voter'}
                onChange={() => setMode('voter')}
                className="h-5 w-5 text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Professional Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  In-depth analysis with sources and citations.
                </p>
              </div>
              <input
                type="radio"
                name="mode"
                checked={mode === 'professional'}
                onChange={() => setMode('professional')}
                className="h-5 w-5 text-blue-600"
              />
            </label>
          </div>
        </div>

        {/* xAI API Key */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">xAI API Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="xai-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your key at <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.x.ai</a>.
                Free tier: Grok 3 (limited quotas). PremiumPlus: Grok 4.
              </p>
            </div>

            <button
              onClick={testApiKey}
              disabled={!apiKey}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Test API Key
            </button>

            {isValidKey !== null && (
              <div className={`p-3 rounded-md ${
                isValidKey ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {isValidKey ? '✅ API Key is valid!' : '❌ Invalid API Key. Check your key and try again.'}
              </div>
            )}
          </div>
        </div>

        {/* AI Model */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">AI Model</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Grok 3 (Free Tier)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Limited quotas, accessible on grok.com, x.com, and apps.
                </p>
              </div>
              <input
                type="radio"
                name="model"
                checked={model === 'grok-3'}
                onChange={() => setModel('grok-3')}
                className="h-5 w-5 text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Grok 4 (PremiumPlus)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced model for SuperGrok and PremiumPlus subscribers.
                </p>
              </div>
              <input
                type="radio"
                name="model"
                checked={model === 'grok-4'}
                onChange={() => setModel('grok-4')}
                className="h-5 w-5 text-blue-600"
              />
            </label>
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bullshit Detector v1.0 — Built with React, Vite, Tailwind, and xAI.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Open source. MIT License.
          </p>
        </div>
      </div>
    </div>
  );
}