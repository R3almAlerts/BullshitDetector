import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, Eye, Trash2 } from 'lucide-react';
import { AnalysisResult, VerdictLevel } from '../types';
import { generateMockAnalysis } from '../utils/mockAnalysis';

export function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<VerdictLevel | 'all'>('all');

  useEffect(() => {
    const mockAnalyses = [
      generateMockAnalysis('Climate change is a hoax'),
      generateMockAnalysis('The 2020 election was stolen'),
      generateMockAnalysis('Vaccines cause autism'),
    ];
    setAnalyses(mockAnalyses);
  }, []);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterVerdict === 'all' || analysis.verdict === filterVerdict;
    return matchesSearch && matchesFilter;
  });

  const verdictOptions: Array<VerdictLevel | 'all'> = ['all', 'true', 'likely-true', 'uncertain', 'likely-false', 'false'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analysis History</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">View previous analyses</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-10" />
            </div>
            <select value={filterVerdict} onChange={(e) => setFilterVerdict(e.target.value as VerdictLevel | 'all')}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              {verdictOptions.map(option => (
                <option key={option} value={option}>{option === 'all' ? 'All' : option.toUpperCase().replace('-', ' ')}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredAnalyses.map((analysis) => (
          <Card key={analysis.id} hover>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={analysis.verdict}>{analysis.verdict.toUpperCase().replace('-', ' ')}</Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 mb-2">{analysis.content}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {analysis.confidence}%</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
