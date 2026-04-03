import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

const holidays = [
  { name: 'Újév', month: 1, day: 1, emoji: '🎆' },
  { name: 'Bálint-nap', month: 2, day: 14, emoji: '❤️' },
  { name: 'Március 15.', month: 3, day: 15, emoji: '🇭🇺' },
  { name: 'Munka ünnepe', month: 5, day: 1, emoji: '⚒️' },
  { name: 'Anyák napja', month: 5, day: 4, emoji: '💐' },
  { name: 'Augusztus 20.', month: 8, day: 20, emoji: '🏛️' },
  { name: 'Október 23.', month: 10, day: 23, emoji: '🕊️' },
  { name: 'Mindenszentek', month: 11, day: 1, emoji: '🕯️' },
  { name: 'Karácsony', month: 12, day: 25, emoji: '🎄' },
  { name: 'Karácsony 2. nap', month: 12, day: 26, emoji: '🎁' },
  { name: 'Szilveszter', month: 12, day: 31, emoji: '🎉' },
];

export default function Holidays() {
  const [upcoming, setUpcoming] = useState<{ name: string; emoji: string; daysUntil: number }[]>([]);

  useEffect(() => {
    const today = new Date();
    const results = holidays.map(h => {
      let next = new Date(today.getFullYear(), h.month - 1, h.day);
      if (next < today) next = new Date(today.getFullYear() + 1, h.month - 1, h.day);
      const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { name: h.name, emoji: h.emoji, daysUntil: diff };
    });
    results.sort((a, b) => a.daysUntil - b.daysUntil);
    setUpcoming(results.slice(0, 4));
  }, []);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">Közelgő Ünnepek</h2>
        <div className="space-y-3">
          {upcoming.map(({ name, emoji, daysUntil }) => (
            <div key={name} className="flex items-center justify-between bg-orange-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{name}</span>
              </div>
              {daysUntil === 0 ? (
                <span className="text-sm font-bold text-pink-500">🎉 Ma!</span>
              ) : (
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{daysUntil} nap</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
