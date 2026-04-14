import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface CountdownEvent {
  id: string;
  name: string;
  date: string;
  emoji: string;
}

const EMOJIS = ['🎯', '✈️', '🎓', '🏖️', '🎂', '💍', '🏆', '🎪', '🎬', '🎵', '⚽', '🏠'];

export default function CountdownEvent() {
  const [events, setEvents] = useState<CountdownEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem('countdownEvents') || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', emoji: '🎯' });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const saveEvents = (updated: CountdownEvent[]) => {
    setEvents(updated);
    localStorage.setItem('countdownEvents', JSON.stringify(updated));
  };

  const addEvent = () => {
    if (!newEvent.name.trim() || !newEvent.date) return;
    const updated = [...events, { id: Date.now().toString(), ...newEvent }];
    saveEvents(updated);
    setNewEvent({ name: '', date: '', emoji: '🎯' });
    setShowForm(false);
  };

  const removeEvent = (id: string) => saveEvents(events.filter(e => e.id !== id));

  const getCountdown = (dateStr: string) => {
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const upcoming = events
    .map(e => ({ ...e, countdown: getCountdown(e.date) }))
    .filter(e => e.countdown !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">Visszaszámlálók</h2>

        {upcoming.length === 0 && !showForm && (
          <p className="text-gray-400 text-sm mb-3">Nincs még esemény</p>
        )}

        <div className="space-y-3 mb-3">
          {upcoming.map(e => (
            <div key={e.id} className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                  {e.emoji} {e.name}
                </span>
                <button onClick={() => removeEvent(e.id)} className="text-red-400 hover:text-red-600 text-lg">×</button>
              </div>
              {e.countdown && (
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { val: e.countdown.days, label: 'nap' },
                    { val: e.countdown.hours, label: 'óra' },
                    { val: e.countdown.minutes, label: 'perc' },
                    { val: e.countdown.seconds, label: 'mp' },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-white dark:bg-gray-600 rounded p-1">
                      <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">{String(val).padStart(2, '0')}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {showForm ? (
          <div className="text-left space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <input type="text" placeholder="Esemény neve" value={newEvent.name}
              onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <input type="date" value={newEvent.date}
              onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => setNewEvent({ ...newEvent, emoji })}
                  className={`text-xl p-1 rounded ${newEvent.emoji === emoji ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addEvent} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Mentés</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Mégse</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
            + Új visszaszámláló
          </button>
        )}
      </div>
    </Card>
  );
}
