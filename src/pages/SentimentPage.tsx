import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function SentimentPage() {
  const [topic, setTopic] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ topic: string; positive: number; neutral: number; negative: number; totalPosts: number } | null>(null);

  const handleSearch = () => {
    if (!topic.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setResults({ topic, positive: 42, neutral: 31, negative: 27, totalPosts: 15432 });
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sentiment Explorer</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Analyze public sentiment on any topic</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a topic..." />
            </div>
            <Button onClick={handleSearch} isLoading={isSearching}><Search className="w-5 h-5 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Results for: {results.topic}</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">{results.totalPosts.toLocaleString()} posts analyzed</span>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{results.positive}%</div>
                  <div className="text-sm text-green-700 dark:text-green-300 mt-1">Positive</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <CardContent className="p-6 text-center">
                  <Minus className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{results.neutral}%</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Neutral</div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-6 text-center">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">{results.negative}%</div>
                  <div className="text-sm text-red-700 dark:text-red-300 mt-1">Negative</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
