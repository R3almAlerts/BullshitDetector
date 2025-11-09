// src/pages/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BarChart3, Shield, User } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Bullshit Detector
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Cut through the noise with AI-powered claim validation and sentiment analysis. Powered by xAI Grok, detect spin, jargon, and nonsense in real time—professional or voter mode.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Get Started
              </Link>
              <Link
                to="/sentiment"
                className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What is Bullshit Detector?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              In an era of misinformation, corporate spin, and political jargon, Bullshit Detector empowers you to verify claims and gauge public sentiment with precision AI. Built on xAI's Grok models, it delivers fast, unbiased analysis—whether you're a voter checking headlines or a professional digging deep.
            </p>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Validator: Fact-check claims with verdict, score, and sources.</span>
              </li>
              <li className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span>Sentiment Analyzer: Scan public opinion on topics with percentages and quotes.</span>
              </li>
              <li className="flex items-center gap-3">
                <User className="h-5 w-5 text-purple-500" />
                <span>Personalized: Voter mode for quick checks, Professional for deep dives with risk assessment.</span>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <ol className="space-y-4 text-gray-600 dark:text-gray-400 list-decimal pl-6">
              <li>
                <strong>Input a Claim or Topic:</strong> Enter text for validation or sentiment scan.
              </li>
              <li>
                <strong>AI Analysis:</strong> Grok processes with NLP for verdict, score, explanation, and sources (Pro mode adds risk and sentiment).
              </li>
              <li>
                <strong>Results & History:</strong> View instant breakdown; save to personal history for review.
              </li>
              <li>
                <strong>Secure & Private:</strong> Your data stays yours—Supabase-backed, GDPR-compliant.
              </li>
            </ol>
          </div>
        </section>

        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to Detect the Bullshit?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands cutting through the noise. Free tier with Grok 3, premium for Grok 4 and advanced features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Get Started
            </Link>
            <Link
              to="/sentiment"
              className="px-8 py-3 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Try Demo
            </Link>
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Bullshit Detector. Powered by xAI Grok. Built with ❤️ for truth.</p>
        </footer>
      </main>
    </div>
  );
};

export default AboutPage;