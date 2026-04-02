import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface NameDayData {
  name: string;
  date: string;
}

export default function NameDay() {
  const [nameDay, setNameDay] = useState<NameDayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNameDay = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/nameday');
        if (!response.ok) throw new Error('Failed to fetch name day');
        const data = await response.json();
        setNameDay(data);
      } catch (error) {
        console.error('Name day error:', error);
        setNameDay({
          name: 'Unknown',
          date: new Date().toLocaleDateString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNameDay();
    const interval = setInterval(fetchNameDay, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !nameDay) {
    return (
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">
          Mai Névnap
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Betöltés...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">
          Mai Névnap
        </h2>

        <div className="space-y-3">
          <div className="text-5xl">👤</div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{nameDay.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{nameDay.date}</p>
        </div>
      </div>
    </Card>
  );
}
