import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface AgeCounterProps {
  birthday: string;
}

export default function AgeCounter({ birthday }: AgeCounterProps) {
  const [age, setAge] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const birth = new Date(birthday);
      const diffMs = now.getTime() - birth.getTime();
      const totalDays = Math.floor(diffMs / 86400000);
      const years = Math.floor(totalDays / 365.25);
      const remaining = diffMs - years * 365.25 * 86400000;
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setAge({ years, days, hours, minutes, seconds, totalDays });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [birthday]);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">Életkorod</h2>
        <div className="text-5xl mb-1">🎂</div>
        <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-3">{age.years} éves</p>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="bg-pink-50 dark:bg-gray-700 rounded p-2">
            <div className="font-bold text-pink-600 dark:text-pink-400">{age.days}</div>
            <div className="text-gray-500 dark:text-gray-400">nap</div>
          </div>
          <div className="bg-pink-50 dark:bg-gray-700 rounded p-2">
            <div className="font-bold text-pink-600 dark:text-pink-400">{age.hours}</div>
            <div className="text-gray-500 dark:text-gray-400">óra</div>
          </div>
          <div className="bg-pink-50 dark:bg-gray-700 rounded p-2">
            <div className="font-bold text-pink-600 dark:text-pink-400">{age.minutes}</div>
            <div className="text-gray-500 dark:text-gray-400">perc</div>
          </div>
          <div className="bg-pink-50 dark:bg-gray-700 rounded p-2">
            <div className="font-bold text-pink-600 dark:text-pink-400">{age.seconds}</div>
            <div className="text-gray-500 dark:text-gray-400">mp</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Összesen <span className="font-bold text-pink-600 dark:text-pink-400">{age.totalDays.toLocaleString('hu-HU')}</span> napot éltél
        </p>
      </div>
    </Card>
  );
}
