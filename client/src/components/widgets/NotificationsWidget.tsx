import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { subscribeToPush, unsubscribeFromPush } from '../../lib/pushHelper';

interface NotificationsWidgetProps {
  birthday: string;
}

export default function NotificationsWidget({ birthday }: NotificationsWidgetProps) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [bSettings, setBSettings] = useState({
    enabled: false, oneWeekBefore: false, threeDaysBefore: false, oneDayBefore: false, onBirthdayDay: false,
  });
  const [nameDayAlerts, setNameDayAlerts] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if ('Notification' in window) setPermission(Notification.permission);
    navigator.serviceWorker?.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub))
    );
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      const s = JSON.parse(saved);
      setBSettings(s.birthday || bSettings);
      setNameDayAlerts(s.nameDayAlerts || false);
    }
  }, []);

  const saveSettings = (updates: any) => {
    const current = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    localStorage.setItem('notificationSettings', JSON.stringify({ ...current, ...updates }));
  };

  const handleEnablePush = async () => {
    setPushLoading(true);
    if (pushEnabled) {
      await unsubscribeFromPush();
      setPushEnabled(false);
    } else {
      const sub = await subscribeToPush();
      setPushEnabled(!!sub);
      if (sub && 'Notification' in window) setPermission(Notification.permission);
    }
    setPushLoading(false);
  };

  const toggleB = (key: string) => {
    const updated = { ...bSettings, [key]: !bSettings[key as keyof typeof bSettings] };
    setBSettings(updated);
    saveSettings({ birthday: updated, enabled: updated.enabled });
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">🔔 Értesítések</h2>
          <button
            onClick={handleEnablePush}
            disabled={pushLoading || permission === 'denied'}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${pushEnabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-50`}
          >
            {pushLoading ? '...' : pushEnabled ? '✅ Bekapcsolva' : 'Bekapcsolás'}
          </button>
        </div>

        {permission === 'denied' && (
          <p className="text-xs text-red-500 mb-3">❌ Értesítések letiltva a böngészőben</p>
        )}

        {/* Birthday quick toggles */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-xs text-gray-700 dark:text-gray-300">🎂 Születésnapi értesítők</span>
            <button onClick={() => toggleB('enabled')}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${bSettings.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${bSettings.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-xs text-gray-700 dark:text-gray-300">👤 Névnap értesítők</span>
            <button onClick={() => { setNameDayAlerts(!nameDayAlerts); saveSettings({ nameDayAlerts: !nameDayAlerts }); }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${nameDayAlerts ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${nameDayAlerts ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Expand for more settings */}
        <button onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-indigo-500 hover:underline text-center">
          {expanded ? '▲ Kevesebb' : '▼ Részletes beállítások'}
        </button>

        {expanded && bSettings.enabled && (
          <div className="mt-3 space-y-2 border-t pt-3 border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Születésnap emlékeztetők</p>
            {[
              { key: 'oneWeekBefore', label: '1 héttel előbb' },
              { key: 'threeDaysBefore', label: '3 nappal előbb' },
              { key: 'oneDayBefore', label: '1 nappal előbb' },
              { key: 'onBirthdayDay', label: 'A születésnapomon 🎉' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
                <button onClick={() => toggleB(key)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${bSettings[key as keyof typeof bSettings] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${bSettings[key as keyof typeof bSettings] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
