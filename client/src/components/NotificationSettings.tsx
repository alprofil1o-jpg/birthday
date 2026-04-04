import { useState, useEffect } from 'react';
import * as React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { subscribeToPush, unsubscribeFromPush } from '../lib/pushHelper';

interface NotificationSettingsProps {
  birthday: string;
}

interface Reminder {
  id: string;
  name: string;
  type: 'once' | 'recurring';
  hour: string;
  date?: string;
  days?: number[];
  weeks?: number;
  startDate?: string;
  active: boolean;
}

const DAY_NAMES = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
const DAY_FULL = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];

export default function NotificationSettings({ birthday }: NotificationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'birthday' | 'nameday' | 'reminders'>('birthday');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Birthday settings
  const [bSettings, setBSettings] = useState({
    enabled: false, oneWeekBefore: false, threeDaysBefore: false, oneDayBefore: false, onBirthdayDay: false,
  });

  // Nameday settings
  const [nameDayAlerts, setNameDayAlerts] = useState(false);
  const [nameDayDays, setNameDayDays] = useState<number[]>([0, 1, 3, 7]);

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    name: '', type: 'once', hour: '08', date: '', days: [], weeks: 1,
    startDate: new Date().toISOString().split('T')[0], active: true,
  });

  useEffect(() => {
    if ('Notification' in window) setPermission(Notification.permission);
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      const s = JSON.parse(saved);
      setBSettings(s.birthday || bSettings);
      setNameDayAlerts(s.nameDayAlerts || false);
      setNameDayDays(s.nameDayAlertDays || [0, 1, 3, 7]);
    }
    setReminders(JSON.parse(localStorage.getItem('customReminders') || '[]'));

    navigator.serviceWorker?.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setPushEnabled(!!sub))
    );
  }, []);

  const saveSettings = (updates: any) => {
    const current = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    const merged = { ...current, ...updates };
    localStorage.setItem('notificationSettings', JSON.stringify(merged));
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

  const toggleBSetting = (key: string) => {
    const updated = { ...bSettings, [key]: !bSettings[key as keyof typeof bSettings] };
    setBSettings(updated);
    saveSettings({ birthday: updated, enabled: updated.enabled });
  };

  const toggleNameDayDay = (d: number) => {
    const updated = nameDayDays.includes(d) ? nameDayDays.filter(x => x !== d) : [...nameDayDays, d];
    setNameDayDays(updated);
    saveSettings({ nameDayAlertDays: updated });
  };

  const saveReminder = () => {
    if (!newReminder.name?.trim()) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      name: newReminder.name!,
      type: newReminder.type!,
      hour: newReminder.hour!,
      date: newReminder.date,
      days: newReminder.days,
      weeks: newReminder.weeks,
      startDate: newReminder.startDate,
      active: true,
    };
    const updated = [...reminders, reminder];
    setReminders(updated);
    localStorage.setItem('customReminders', JSON.stringify(updated));
    setShowReminderForm(false);
    setNewReminder({ name: '', type: 'once', hour: '08', date: '', days: [], weeks: 1, startDate: new Date().toISOString().split('T')[0], active: true });
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('customReminders', JSON.stringify(updated));
  };

  const toggleReminderActive = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setReminders(updated);
    localStorage.setItem('customReminders', JSON.stringify(updated));
  };

  const toggleDay = (d: number) => {
    const days = newReminder.days || [];
    setNewReminder({ ...newReminder, days: days.includes(d) ? days.filter(x => x !== d) : [...days, d] });
  };

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="text-sm">
        🔔 Értesítések
      </Button>

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-hidden">
          {/* Push toggle header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Push értesítések</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {pushEnabled ? '✅ Engedélyezve' : permission === 'denied' ? '❌ Letiltva a böngészőben' : 'Háttérben is működik'}
                </p>
              </div>
              <button
                onClick={handleEnablePush}
                disabled={pushLoading || permission === 'denied'}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pushEnabled ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-50`}
              >
                {pushLoading ? '...' : pushEnabled ? 'Kikapcsolás' : 'Bekapcsolás'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['birthday', 'nameday', 'reminders'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
              >
                {t === 'birthday' ? '🎂 Születésnap' : t === 'nameday' ? '👤 Névnap' : '⏰ Emlékeztetők'}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">

            {/* Birthday tab */}
            {tab === 'birthday' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <Label className="text-sm">Értesítések be</Label>
                  <Switch checked={bSettings.enabled} onCheckedChange={() => toggleBSetting('enabled')} />
                </div>
                {bSettings.enabled && (
                  <>
                    {[
                      { key: 'oneWeekBefore', label: '1 héttel előbb' },
                      { key: 'threeDaysBefore', label: '3 nappal előbb' },
                      { key: 'oneDayBefore', label: '1 nappal előbb' },
                      { key: 'onBirthdayDay', label: 'A születésnapomon 🎉' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={bSettings[key as keyof typeof bSettings] as boolean} onCheckedChange={() => toggleBSetting(key)} />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Nameday tab */}
            {tab === 'nameday' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <Label className="text-sm">Névnap értesítők be</Label>
                  <Switch checked={nameDayAlerts} onCheckedChange={v => { setNameDayAlerts(v); saveSettings({ nameDayAlerts: v }); }} />
                </div>
                {nameDayAlerts && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Emlékeztess ennyivel előbb:</p>
                    <div className="flex flex-wrap gap-2">
                      {[{ d: 0, label: 'Aznap' }, { d: 1, label: '1 nap' }, { d: 3, label: '3 nap' }, { d: 7, label: '1 hét' }].map(({ d, label }) => (
                        <button
                          key={d}
                          onClick={() => toggleNameDayDay(d)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${nameDayDays.includes(d) ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">A névnapokat a Névnap widgetben kezelheted.</p>
                  </div>
                )}
              </div>
            )}

            {/* Reminders tab */}
            {tab === 'reminders' && (
              <div className="space-y-3">
                {reminders.map(r => (
                  <div key={r.id} className={`p-3 rounded-lg border ${r.active ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{r.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {r.type === 'once' ? `📅 ${r.date} — ${r.hour}:00` : `🔁 ${(r.days || []).map(d => DAY_NAMES[d]).join(', ')} — ${r.hour}:00 — ${r.weeks} hét`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch checked={r.active} onCheckedChange={() => toggleReminderActive(r.id)} />
                        <button onClick={() => deleteReminder(r.id)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                      </div>
                    </div>
                  </div>
                ))}

                {!showReminderForm ? (
                  <button
                    onClick={() => setShowReminderForm(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                  >
                    + Új emlékeztető
                  </button>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
                    <input
                      type="text"
                      placeholder="Emlékeztető neve"
                      value={newReminder.name}
                      onChange={e => setNewReminder({ ...newReminder, name: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />

                    {/* Type selector */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewReminder({ ...newReminder, type: 'once' })}
                        className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${newReminder.type === 'once' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Egyszeri
                      </button>
                      <button
                        onClick={() => setNewReminder({ ...newReminder, type: 'recurring' })}
                        className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${newReminder.type === 'recurring' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                      >
                        Ismétlődő
                      </button>
                    </div>

                    {newReminder.type === 'once' ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Dátum</label>
                          <input
                            type="date"
                            value={newReminder.date}
                            onChange={e => setNewReminder({ ...newReminder, date: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Időpont</label>
                          <input
                            type="time"
                            value={`${newReminder.hour}:00`}
                            onChange={e => setNewReminder({ ...newReminder, hour: e.target.value.split(':')[0] })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Napok</label>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {DAY_NAMES.map((n, i) => (
                              <button
                                key={i}
                                onClick={() => toggleDay(i)}
                                className={`w-9 h-9 rounded-full text-xs font-medium transition-colors ${(newReminder.days || []).includes(i) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Hány héten át</label>
                          <input
                            type="number"
                            min="1"
                            max="52"
                            value={newReminder.weeks}
                            onChange={e => setNewReminder({ ...newReminder, weeks: parseInt(e.target.value) })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Kezdő dátum</label>
                          <input
                            type="date"
                            value={newReminder.startDate}
                            onChange={e => setNewReminder({ ...newReminder, startDate: e.target.value })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">Időpont</label>
                          <input
                            type="time"
                            value={`${newReminder.hour}:00`}
                            onChange={e => setNewReminder({ ...newReminder, hour: e.target.value.split(':')[0] })}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-1"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={saveReminder} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Mentés</button>
                      <button onClick={() => setShowReminderForm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Mégse</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
