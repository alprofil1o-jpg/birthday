import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

const staticHolidays = [
  { name: 'Újév', month: 1, day: 1, emoji: '🎆' },
  { name: 'Valentin-nap', month: 2, day: 14, emoji: '❤️' },
  { name: 'Pizza napja', month: 2, day: 9, emoji: '🍕' },
  { name: 'Macska napja', month: 2, day: 22, emoji: '🐱' },
  { name: 'Nők napja', month: 3, day: 8, emoji: '🌸' },
  { name: 'Március 15.', month: 3, day: 15, emoji: '🇭🇺' },
  { name: 'Bolondok napja', month: 4, day: 1, emoji: '🤡' },
  { name: 'Könyv napja', month: 4, day: 23, emoji: '📚' },
  { name: 'Föld napja', month: 4, day: 22, emoji: '🌍' },
  { name: 'Munka ünnepe', month: 5, day: 1, emoji: '⚒️' },
  { name: 'Gyermeknap', month: 6, day: 1, emoji: '🧒' },
  { name: 'Zene napja', month: 6, day: 21, emoji: '🎵' },
  { name: 'Emoji napja', month: 7, day: 17, emoji: '😀' },
  { name: 'Barátság napja', month: 7, day: 30, emoji: '🤝' },
  { name: 'Csokoládé napja', month: 7, day: 7, emoji: '🍫' },
  { name: 'Fagylalt napja', month: 7, day: 24, emoji: '🍦' },
  { name: 'Augusztus 20.', month: 8, day: 20, emoji: '🏛️' },
  { name: 'Kutya napja', month: 8, day: 26, emoji: '🐶' },
  { name: 'Kávé napja', month: 10, day: 1, emoji: '☕' },
  { name: 'Állatok világnapja', month: 10, day: 4, emoji: '🐾' },
  { name: 'Október 23.', month: 10, day: 23, emoji: '🕊️' },
  { name: 'Halloween', month: 10, day: 31, emoji: '🎃' },
  { name: 'Mindenszentek', month: 11, day: 1, emoji: '🕯️' },
  { name: 'Internet napja', month: 10, day: 29, emoji: '🌐' },
  { name: 'Mikulás', month: 12, day: 6, emoji: '🎅' },
  { name: 'Karácsony', month: 12, day: 25, emoji: '🎄' },
  { name: 'Karácsony 2. nap', month: 12, day: 26, emoji: '🎁' },
  { name: 'Szilveszter', month: 12, day: 31, emoji: '🎉' },
];

function getEaster(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function getFirstSunday(year: number, month: number) {
  const d = new Date(year, month - 1, 1);
  const dow = d.getDay();
  return dow === 0 ? 1 : 8 - dow;
}

export default function Holidays() {
  const [upcoming, setUpcoming] = useState<{ name: string; emoji: string; daysUntil: number }[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();

    const easter = getEaster(year);
    const easterDate = new Date(year, easter.month - 1, easter.day);
    const easterMonday = new Date(easterDate); easterMonday.setDate(easterMonday.getDate() + 1);
    const pentecost = new Date(easterDate); pentecost.setDate(pentecost.getDate() + 49);
    const mothersSunday = getFirstSunday(year, 5);
    const fathersDay = getFirstSunday(year, 6) + 14;

    const dynamic = [
      { name: 'Húsvét', month: easter.month, day: easter.day, emoji: '🐣' },
      { name: 'Húsvét hétfő', month: easterMonday.getMonth() + 1, day: easterMonday.getDate(), emoji: '🥚' },
      { name: 'Pünkösd', month: pentecost.getMonth() + 1, day: pentecost.getDate(), emoji: '✨' },
      { name: 'Anyák napja', month: 5, day: mothersSunday, emoji: '💐' },
      { name: 'Apák napja', month: 6, day: fathersDay > 30 ? fathersDay - 30 : fathersDay, emoji: '👨' },
    ];

    const all = [...staticHolidays, ...dynamic];

    const results = all.map(h => {
      let next = new Date(today.getFullYear(), h.month - 1, h.day);
      if (next < today) next = new Date(today.getFullYear() + 1, h.month - 1, h.day);
      const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { name: h.name, emoji: h.emoji, daysUntil: diff };
    });

    results.sort((a, b) => a.daysUntil - b.daysUntil);
    setUpcoming(results);
  }, []);

  const displayed = showAll ? upcoming : upcoming.slice(0, 5);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">Közelgő Ünnepek</h2>
        <div className="space-y-2">
          {displayed.map(({ name, emoji, daysUntil }) => (
            <div key={name} className="flex items-center justify-between bg-orange-50 dark:bg-gray-700 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{emoji}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{name}</span>
              </div>
              {daysUntil === 0
                ? <span className="text-sm font-bold text-pink-500">🎉 Ma!</span>
                : daysUntil === 1
                  ? <span className="text-sm font-bold text-red-500">Holnap!</span>
                  : <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{daysUntil} nap</span>
              }
            </div>
          ))}
        </div>
        <button onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-orange-500 hover:underline">
          {showAll ? '▲ Kevesebb' : `▼ Mind (${upcoming.length} ünnep)`}
        </button>
      </div>
    </Card>
  );
}
