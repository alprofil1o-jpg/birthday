import * as React from 'react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

interface BirthdaySetupProps {
  onSetBirthday: (date: string) => void;
}

export default function BirthdaySetup({ onSetBirthday }: BirthdaySetupProps) {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!date) {
      setError('Kérjük válassz egy dátumot');
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();

    if (selectedDate > today) {
      setError('A születési nap nem lehet a jövőben');
      return;
    }

    onSetBirthday(date);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          Születésnapi Számláló
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Állítsd be a születésnapodat az induláshoz
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Születésnapod
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError('');
              }}
              className="w-full"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Beállít
          </Button>
        </div>
      </Card>
    </div>
  );
}
