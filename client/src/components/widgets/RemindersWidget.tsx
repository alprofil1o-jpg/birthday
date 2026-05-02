import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';
import { syncSettingsToServer, loadSettingsFromServer } from '../../lib/pushHelper';

interface RemindersWidgetProps {
  birthday: string;
}

interface Reminder {
  id: string;
  name: string;
  type: 'once' | 'recurring';
  hour: string;
  minute: string;
  date?: string;
  days?: number[];
  weeks?: number;
  startDate?: string;
  active: boolean;
}

const DAY_NAMES = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];

export default function RemindersWidget({ birthday }: RemindersWidgetProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const syncTimeout = useRef<any>(null);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    name: '', type: 'once', hour: '08', minute: '00', date: '', days: [], weeks: 1,
    startDate: new Date().toISOString().split('T')[0], active: true,
  });

  // Betöltés
  useEffect(() => {
    const load = async () => {
      setSyncing(true);
      try {
        const serverData = await loadSettingsFromServer(birthday);
        if (serverData?.reminders?.length > 0) {
          setReminders(serverData.reminders);
          localStorage.setItem('customReminders', JSON.stringify(serverData.reminders));
          setLastSync(new Date().toLocaleTimeString('hu-HU'));
        } else {
          setReminders(JSON.parse(localStorage.getItem('customReminders') || '[]'));
        }
      } catch {
        setReminders(JSON.parse(localStorage.getItem('customReminders') || '[]'));
      } finally {
        setSyncing(false);
      }
    };
    load();
  }, [birthday]);

  // Emlékeztető checker
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const nowH = now.getHours();
      const nowM = now.getMinutes();
      const current: Reminder[] = JSON.parse(localStorage.getItem('customReminders') || '[]');
      for (const r of current) {
        if (!r.active) continue;
        if (parseInt(r.hour || '8') !== nowH || parseInt(r.minute || '0') !== nowM) continue;
        const key = `reminder_fired_${r.id}_${todayStr}_${nowH}_${nowM}`;
        if (localStorage.getItem(key)) continue;
        let fire = false;
        if (r.type === 'once') {
          fire = r.date === todayStr;
        } else {
          const dow = now.getDay();
          if ((r.days || []).includes(dow)) {
            const start = new Date(r.startDate || todayStr);
            const end = new Date(start);
            end.setDate(end.getDate() + (r.weeks || 1) * 7);
            fire = now >= start && now <= end;
          }
        }
        if (fire) {
          fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `⏰ ${r.name}`, body: r.type === 'recurring' ? 'Ismétlődő emlékeztető!' : 'Emlékeztető!', tag: `reminder-${r.id}` }),
          }).catch(() => {
            if (Notification.permission === 'granted') new Notification(`⏰ ${r.name}`, { body: 'Emlékeztető!', icon: '/icon-192.png' });
          });
          localStorage.setItem(key, '1');
        }
      }
    };
    const i = setInterval(check, 30000);
    check();
    return () => clearInterval(i);
  }, []);

  const syncToServer = (updated: Reminder[]) => {
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(async () => {
      setSyncing(true);
      try {
        const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        const savedNames = JSON.parse(localStorage.getItem('savedNameDays') || '[]');
        await syncSettingsToServer(birthday, { savedNames, reminders: updated, notificationSettings: settings });
        setLastSync(new Date().toLocaleTimeString('hu-HU'));
      } catch {} finally { setSyncing(false); }
    }, 1000);
  };

  const saveReminder = () => {
    if (!newReminder.name?.trim()) return;
    const r: Reminder = {
      id: Date.now().toString(),
      name: newReminder.name!,
      type: newReminder.type!,
      hour: newReminder.hour!,
      minute: newReminder.minute || '00',
      date: newReminder.date,
      days: newReminder.days,
      weeks: newReminder.weeks,
      startDate: newReminder.startDate,
      active: true,
    };
    const updated = [...reminders, r];
    setReminders(updated);
    localStorage.setItem('customReminders', JSON.stringify(updated));
    syncToServer(updated);
    setShowReminderForm(false);
    setNewReminder({ name: '', type: 'once', hour: '08', minute: '00', date: '', days: [], weeks: 1, startDate: new Date().toISOString().split('T')[0], active: true });
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('customReminders', JSON.stringify(updated));
    syncToServer(updated);
  };

  const toggleActive = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setReminders(updated);
    localStorage.setItem('customReminders', JSON.stringify(updated));
    syncToServer(updated);
  };

  const toggleDay = (d: number) => {
    const days = newReminder.days || [];
    setNewReminder({ ...newReminder, days: days.includes(d) ? days.filter(x => x !== d) : [...days, d] });
  };

  const timeInput = (
    <div>
      <label className="text-xs text-gray-500 dark:text-gray-400">Időpont</label>
      <input type="time"
        value={`${(newReminder.hour||'08').padStart(2,'0')}:${(newReminder.minute||'00').padStart(2,'0')}`}
        onChange={e => { const [h, m] = e.target.value.split(':'); setNewReminder({ ...newReminder, hour: h, minute: m }); }}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1" />
    </div>
  );

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">⏰ Emlékeztetők</h2>
        {syncing ? (
          <span className="text-xs text-blue-500">🔄 Szinkron...</span>
        ) : lastSync ? (
          <span className="text-xs text-green-500">✅ {lastSync}</span>
        ) : null}
      </div>

      <div className="space-y-2 mb-3 mt-3">
        {reminders.length === 0 && !showReminderForm && (
          <p className="text-center text-gray-400 text-sm py-2">Még nincs emlékeztető</p>
        )}
        {reminders.map(r => (
          <div key={r.id} className={`p-3 rounded-lg border ${r.active ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-60'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{r.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {r.type === 'once'
                    ? `📅 ${r.date} — ${(r.hour||'00').padStart(2,'0')}:${(r.minute||'00').padStart(2,'0')}`
                    : `🔁 ${(r.days||[]).map(d => DAY_NAMES[d]).join(', ')} — ${(r.hour||'00').padStart(2,'0')}:${(r.minute||'00').padStart(2,'0')} — ${r.weeks} hét`
                  }
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(r.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.active ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${r.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => deleteReminder(r.id)} className="text-red-400 hover:text-red-600 ml-1 text-lg leading-none">×</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!showReminderForm ? (
        <button onClick={() => setShowReminderForm(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
          + Új emlékeztető
        </button>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3 mt-2">
          <input type="text" placeholder="Emlékeztető neve" value={newReminder.name}
            onChange={e => setNewReminder({ ...newReminder, name: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

          <div className="flex gap-2">
            {(['once', 'recurring'] as const).map(t => (
              <button key={t} onClick={() => setNewReminder({ ...newReminder, type: t })}
                className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${newReminder.type === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {t === 'once' ? 'Egyszeri' : 'Ismétlődő'}
              </button>
            ))}
          </div>

          {newReminder.type === 'once' ? (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Dátum</label>
                <input type="date" value={newReminder.date}
                  onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1" />
              </div>
              {timeInput}
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Napok</label>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {DAY_NAMES.map((n, i) => (
                    <button key={i} onClick={() => toggleDay(i)}
                      className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${(newReminder.days||[]).includes(i) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Hány héten át</label>
                <input type="number" min="1" max="52" value={newReminder.weeks}
                  onChange={e => setNewReminder({ ...newReminder, weeks: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Kezdő dátum</label>
                <input type="date" value={newReminder.startDate}
                  onChange={e => setNewReminder({ ...newReminder, startDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1" />
              </div>
              {timeInput}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={saveReminder} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Mentés</button>
            <button onClick={() => setShowReminderForm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Mégse</button>
          </div>
        </div>
      )}
    </Card>
  );
}
