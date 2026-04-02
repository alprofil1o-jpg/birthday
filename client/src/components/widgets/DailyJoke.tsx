import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface JokeData {
  setup: string;
  delivery: string;
}

export default function DailyJoke() {
  const [joke, setJoke] = useState<JokeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelivery, setShowDelivery] = useState(false);

  useEffect(() => {
    const fetchJoke = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/joke');
        if (!response.ok) throw new Error('Failed to fetch joke');
        const data = await response.json();
        setJoke(data);
        setShowDelivery(false);
      } catch (error) {
        console.error('Joke error:', error);
        setJoke({
          setup: 'Why did the programmer quit his job?',
          delivery: 'Because he did not get arrays!',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJoke();
  }, []);

  if (loading || !joke) {
    return (
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">
          Napi Vicc
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Betöltés...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">
          Napi Vicc
        </h2>

        <div className="space-y-4">
          <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">{joke.setup}</p>

          {showDelivery && (
            <p className="text-lg text-indigo-600 dark:text-indigo-400 font-bold">{joke.delivery}</p>
          )}

          <button
            onClick={() => setShowDelivery(!showDelivery)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            {showDelivery ? 'Poén elrejtése' : 'Poén megjelenítése'}
          </button>
        </div>
      </div>
    </Card>
  );
}
