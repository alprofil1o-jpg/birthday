import * as React from 'react';
import { useState, useEffect } from 'react';
import Clock from '../components/widgets/Clock';
import BirthdayCountdown from '../components/widgets/BirthdayCountdown';
import Weather from '../components/widgets/Weather';
import DailyJoke from '../components/widgets/DailyJoke';
import NameDay from '../components/widgets/NameDay';
import NotificationSettings from './NotificationSettings';
import { Button } from '../components/ui/button';

interface DashboardProps {
  birthday: string;
  onChangeBirthday: (date: string) => void;
}

export default function Dashboard({ birthday, onChangeBirthday }: DashboardProps) {
  const handleChangeBirthday = () => {
    localStorage.removeItem('userBirthday');
    onChangeBirthday('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Születésnapi Számláló
          </h1>
          <div className="flex gap-2">
            <NotificationSettings birthday={birthday} />
            <Button
              onClick={handleChangeBirthday}
              variant="outline"
              className="text-sm"
            >
              Születésnap Módosítása
            </Button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Clock */}
          <Clock />

          {/* Birthday Countdown */}
          <BirthdayCountdown birthday={birthday} />

          {/* Weather */}
          <Weather />

          {/* Name Day */}
          <NameDay />

          {/* Daily Joke */}
          <div className="lg:col-span-3">
            <DailyJoke />
          </div>
        </div>
      </div>
    </div>
  );
}
