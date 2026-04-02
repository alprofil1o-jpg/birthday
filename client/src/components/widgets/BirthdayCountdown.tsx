import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface BirthdayCountdownProps {
  birthday: string;
}

interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
}

export default function BirthdayCountdown({ birthday }: BirthdayCountdownProps) {
  const [countdown, setCountdown] = useState<CountdownData | null>(null);

  useEffect(() => {
    const calculateCountdown = () => {
      const today = new Date();
      const birthdayDate = new Date(birthday);

      let nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());

      if (nextBirthday < today) {
        nextBirthday = new Date(today.getFullYear() + 1, birthdayDate.getMonth(), birthdayDate.getDate());
      }

      const isToday =
        today.getMonth() === birthdayDate.getMonth() &&
        today.getDate() === birthdayDate.getDate();

      const diff = nextBirthday.getTime() - today.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds, isToday });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [birthday]);

  if (!countdown) return null;

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">
          Születésnapi Számláló
        </h2>

        {countdown.isToday ? (
          <div className="text-4xl font-bold text-pink-500 dark:text-pink-400 animate-bounce">
            🎉 Boldog Születésnapot! 🎉
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {countdown.days}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Nap van hátra</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-indigo-50 dark:bg-gray-700 rounded p-2">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{countdown.hours}</div>
                <div className="text-gray-600 dark:text-gray-400">Óra</div>
              </div>
              <div className="bg-indigo-50 dark:bg-gray-700 rounded p-2">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{countdown.minutes}</div>
                <div className="text-gray-600 dark:text-gray-400">Perc</div>
              </div>
              <div className="bg-indigo-50 dark:bg-gray-700 rounded p-2">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{countdown.seconds}</div>
                <div className="text-gray-600 dark:text-gray-400">Másodperc</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
