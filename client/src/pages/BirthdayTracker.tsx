import * as React from 'react';
import { useState, useEffect } from 'react';
import BirthdaySetup from '../components/BirthdaySetup';
import Dashboard from '../components/Dashboard';

export default function BirthdayTracker() {
  const [birthday, setBirthday] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('userBirthday');
    if (saved) {
      setBirthday(saved);
    }
    setIsLoading(false);
  }, []);

  const handleSetBirthday = (date: string) => {
    localStorage.setItem('userBirthday', date);
    setBirthday(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">Loading...</div>
      </div>
    );
  }

  return birthday ? (
    <Dashboard birthday={birthday} onChangeBirthday={handleSetBirthday} />
  ) : (
    <BirthdaySetup onSetBirthday={handleSetBirthday} />
  );
}
