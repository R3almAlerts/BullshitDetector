import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-8 text-center">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Bullshit Detector
      </h1>
      <p className="max-w-xl text-xl text-gray-600 dark:text-gray-400">
        Detect political spin, corporate jargon, and nonsense in real time.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/analyzer')}
          className="rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
        >
          Start Analyzing
        </button>
        <button
          onClick={() => navigate('/sentiment')}
          className="rounded-lg border-2 border-blue-600 px-8 py-4 font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          View Sentiment
        </button>
      </div>
    </div>
  );
}