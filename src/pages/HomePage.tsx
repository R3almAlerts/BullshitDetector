import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Users, TrendingUp, Shield, Zap, CheckCircle } from 'lucide-react';
import { useUserMode } from '../contexts/UserModeContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { mode } = useUserMode();

  const features = [
    { icon: Shield, title: 'AI-Powered Detection', description: 'Advanced algorithms analyze claims against verified sources' },
    { icon: TrendingUp, title: 'Sentiment Analysis', description: 'Track public opinion across social media' },
    { icon: Zap, title: 'Real-Time Results', description: 'Get instant fact-checking results' },
    { icon: CheckCircle, title: 'Evidence-Based', description: 'Every verdict includes sources' },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">Welcome to Bullshit Detector</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">AI-powered misinformation detection for media researchers and voters.</p>
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button size="lg" onClick={() => onNavigate('analyzer')}><Search className="w-5 h-5 mr-2" />Start Analyzing</Button>
          <Button variant="secondary" size="lg" onClick={() => onNavigate('sentiment')}><TrendingUp className="w-5 h-5 mr-2" />Explore Sentiment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} hover>
              <CardContent className="p-6 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {mode === 'voter' && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Try Professional Mode</h3>
                <p className="text-gray-700 dark:text-gray-300">Unlock advanced analytics and collaborative features</p>
              </div>
              <Button size="lg" onClick={() => onNavigate('settings')}><Users className="w-5 h-5 mr-2" />Upgrade</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
