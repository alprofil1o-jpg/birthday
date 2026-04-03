import * as React from 'react';
import { useState } from 'react';
import Clock from '../components/widgets/Clock';
import BirthdayCountdown from '../components/widgets/BirthdayCountdown';
import Weather from '../components/widgets/Weather';
import DailyJoke from '../components/widgets/DailyJoke';
import NameDay from '../components/widgets/NameDay';
import AgeCounter from '../components/widgets/AgeCounter';
import Holidays from '../components/widgets/Holidays';
import NotificationSettings from './NotificationSettings';
import { Button } from '../components/ui/button';

interface DashboardProps {
  birthday: string;
  onChangeBirthday: (date: string) => void;
}

export default function Dashboard({ birthday, onChangeBirthday }: DashboardProps) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleChangeBirthday = () => {
    localStorage.removeItem('userBirthday');
    onChangeBirthday('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Születésnapi Számláló
          </h1>
          <div className="flex gap-2 items-center">
            <NotificationSettings birthday={birthday} />
            <Button onClick={handleChangeBirthday} variant="outline" className="text-sm">
              Születésnap Módosítása
            </Button>
            <button
              onClick={toggleDark}
              className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl hover:scale-110 transition-transform"
              title={isDark ? 'Világos mód' : 'Sötét mód'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Clock />
          <BirthdayCountdown birthday={birthday} />
          <Weather />
          <NameDay />
          <AgeCounter birthday={birthday} />
          <Holidays />
          <div className="lg:col-span-3">
            <DailyJoke />
          </div>
        </div>
      </div>
    </div>
  );
}
