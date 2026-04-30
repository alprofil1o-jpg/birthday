import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface AppSettingsProps {
  birthday: string;
}

export default function AppSettings({ birthday }: AppSettingsProps) {
  const [lockRotation, setLockRotation] = useState(false);
  const [disableEasterEggs, setDisableEasterEggs] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Betöltés DB-ből
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/app-settings/${encodeURIComponent(birthday)}`);
        if (res.ok) {
          const data = await res.json();
          setLockRotation(data.lockRotation ?? false);
          setDisableEasterEggs(data.disableEasterEggs ?? false);
        }
      } catch {
        setLockRotation(localStorage.getItem('lockRotation') === 'true');
        setDisableEasterEggs(localStorage.getItem('disableEasterEggs') === 'true');
      }
    }
    load();
  }, [birthday]);

  async function saveToDb(lr: boolean, dee: boolean) {
    localStorage.setItem('lockRotation', String(lr));
    localStorage.setItem('disableEasterEggs', String(dee));
    try {
      await fetch(`/api/app-settings/${encodeURIComponent(birthday)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockRotation: lr, disableEasterEggs: dee }),
      });
    } catch {}
  }

  const handleLockRotation = (val: boolean) => {
    setLockRotation(val);
    saveToDb(val, disableEasterEggs);
    if (val) { try { (screen.orientation as any)?.lock?.('portrait'); } catch {} }
    else { try { (screen.orientation as any)?.unlock?.(); } catch {} }
  };

  const handleDisableEasterEggs = (val: boolean) => {
    setDisableEasterEggs(val);
    saveToDb(lockRotation, val);
    if (val) {
      document.body.style.transition = 'transform 0.5s ease';
      document.body.style.transform = 'rotate(0deg)';
    }
  };

  const settings = [
    {
      key: 'lockRotation',
      label: 'Képernyő elforgatás tiltása',
      desc: 'Portré módban tartja az appot',
      emoji: '🔒',
      value: lockRotation,
      onChange: handleLockRotation,
    },
    {
      key: 'disableEasterEggs',
      label: 'Easter egg-ek kikapcsolása',
      desc: 'Bálint/derék nem forgatja az oldalt',
      emoji: '🥚',
      value: disableEasterEggs,
      onChange: handleDisableEasterEggs,
    },
  ];

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase text-center">⚙️ Beállítások</h2>

      <div className="space-y-3">
        {settings.map(s => (
          <div key={s.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-lg">{s.emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
              </div>
            </div>
            <button
              onClick={() => s.onChange(!s.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-2 ${s.value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.value ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowInfo(true)}
        className="w-full mt-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm hover:bg-indigo-100 transition-colors"
      >
        ℹ️ Az appról
      </button>

      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowInfo(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-80 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🎂</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Birthday Buddy</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">v2.0</p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-3">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Készítette</p>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Buday Bálint</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-3">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Youtube</p>
              <a href="https://www.youtube.com/@BálintKalandjai" target="_blank" rel="noopener noreferrer"
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Bálint Kalandjai</a>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Weboldal</p>
              <a href="https://balint12.hu" target="_blank" rel="noopener noreferrer"
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400">balint12.hu</a>
            </div>
            <div className="text-xs text-gray-400 space-y-1 mb-5">
              <p>React + TypeScript + Tailwind</p>
              <p>Express + PostgreSQL · Railway 🚀</p>
            </div>
            <button onClick={() => setShowInfo(false)}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">
              Bezárás
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
