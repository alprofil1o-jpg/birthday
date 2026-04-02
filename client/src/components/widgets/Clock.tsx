import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

export default function Clock() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
      
      const dateString = now.toLocaleDateString('hu-HU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setDate(dateString);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">
          Aktuális Idő
        </h2>
        <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mb-4">
          {time}
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-lg">{date}</p>
      </div>
    </Card>
  );
}
