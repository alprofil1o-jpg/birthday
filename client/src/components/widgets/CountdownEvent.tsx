import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';

interface SavedTimer {
  id: string;
  name: string;
  emoji: string;
  totalSeconds: number;
}

const EMOJIS = ['⏱️', '🍕', '☕', '🏃', '📚', '🎮', '💤', '🍳', '🏋️', '🎯', '✈️', '🎂'];
const QUICK = [
  { label: '1p', s: 60 }, { label: '5p', s: 300 }, { label: '10p', s: 600 },
  { label: '15p', s: 900 }, { label: '30p', s: 1800 }, { label: '1ó', s: 3600 },
];

function ScrollPicker({ value, min, max, onChange, label }: {
  value: number; min: number; max: number; onChange: (v: number) => void; label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM_H = 40;

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = (value - min) * ITEM_H;
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollTop / ITEM_H);
    const v = Math.min(max, Math.max(min, min + idx));
    if (v !== value) onChange(v);
  };

  const items = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="flex flex-col items-center select-none">
      <span className="text-xs text-gray-400 mb-1">{label}</span>
      <div className="relative" style={{ width: 52, height: 120 }}>
        {/* Highlight bar */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg z-0 pointer-events-none" />
        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full overflow-y-auto z-10 relative"
          style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
        >
          <style>{`.scroll-hide::-webkit-scrollbar{display:none}`}</style>
          <div className="scroll-hide" style={{ paddingTop: 40, paddingBottom: 40 }}>
            {items.map(v => (
              <div
                key={v}
                onClick={() => {
                  onChange(v);
                  if (ref.current) ref.current.scrollTop = (v - min) * ITEM_H;
                }}
                style={{ scrollSnapAlign: 'center', height: ITEM_H }}
                className={`flex items-center justify-center font-mono font-bold cursor-pointer transition-all ${
                  v === value ? 'text-2xl text-gray-900 dark:text-white' : 'text-lg text-gray-300 dark:text-gray-600'
                }`}
              >
                {String(v).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RingProgress({ percent, children }: { percent: number; children?: React.ReactNode }) {
  const size = 180;
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="12"
          className="text-gray-100 dark:text-gray-700" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#fb923c" strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 8px rgba(251,146,60,0.7))' }} />
      </svg>
      <div className="relative z-10 text-center">{children}</div>
    </div>
  );
}

export default function CountdownEvent() {
  const [tab, setTab] = useState<'timer' | 'events'>('timer');

  // Timer
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [totalSet, setTotalSet] = useState(0);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<any>(null);
  const endRef = useRef<number>(0);

  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedTimers') || '[]'); } catch { return []; }
  });
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveEmoji, setSaveEmoji] = useState('⏱️');

  // Events
  const [events, setEvents] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('countdownEvents') || '[]'); } catch { return []; }
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', emoji: '🎯' });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(i); clearInterval(intervalRef.current); };
  }, []);

  const getTotalSecs = () => days * 86400 + hours * 3600 + minutes * 60 + secs;

  const startTimer = (total?: number) => {
    const t = total ?? getTotalSecs();
    if (t <= 0) return;
    clearInterval(intervalRef.current);
    setTotalSet(t);
    setFinished(false);
    endRef.current = Date.now() + t * 1000;
    setRemaining(t);
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setFinished(true);
        if (Notification.permission === 'granted') {
          new Notification('⏰ Időzítő lejárt!', { body: 'Az idő letelt!', icon: '/icon-192.png' });
        }
      }
    }, 500);
    setRunning(true);
  };

  const pause = () => { clearInterval(intervalRef.current); setRunning(false); };
  const resume = () => {
    if (!remaining || remaining <= 0) return;
    endRef.current = Date.now() + remaining * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) { clearInterval(intervalRef.current); setRunning(false); setFinished(true); }
    }, 500);
    setRunning(true);
  };
  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setRemaining(null); setFinished(false); };

  const fmtSecs = (s: number) => {
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (d > 0) return `${d}n ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const percent = remaining !== null && totalSet > 0 ? (remaining / totalSet) * 100 : 100;

  const saveTimerFn = () => {
    if (!saveName.trim()) return;
    const t: SavedTimer = { id: Date.now().toString(), name: saveName, emoji: saveEmoji, totalSeconds: getTotalSecs() };
    const updated = [...savedTimers, t];
    setSavedTimers(updated);
    localStorage.setItem('savedTimers', JSON.stringify(updated));
    setShowSave(false); setSaveName('');
  };

  const getCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - now.getTime();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const addEvent = () => {
    if (!newEvent.name.trim() || !newEvent.date) return;
    const updated = [...events, { id: Date.now().toString(), ...newEvent }];
    setEvents(updated);
    localStorage.setItem('countdownEvents', JSON.stringify(updated));
    setNewEvent({ name: '', date: '', emoji: '🎯' });
    setShowEventForm(false);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        <button onClick={() => setTab('timer')}
          className={`flex-1 py-3 text-xs font-semibold transition-colors ${tab === 'timer' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>
          ⏰ Időzítő
        </button>
        <button onClick={() => setTab('events')}
          className={`flex-1 py-3 text-xs font-semibold transition-colors ${tab === 'events' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
          📅 Események
        </button>
      </div>

      <div className="p-5">
        {tab === 'timer' && (
          <div className="text-center">
            {remaining === null ? (
              <>
                <div className="flex justify-center items-end gap-1 mb-5">
                  <ScrollPicker value={days} min={0} max={99} onChange={setDays} label="Nap" />
                  <span className="text-2xl font-bold text-gray-200 dark:text-gray-600 mb-3">:</span>
                  <ScrollPicker value={hours} min={0} max={23} onChange={setHours} label="Óra" />
                  <span className="text-2xl font-bold text-gray-200 dark:text-gray-600 mb-3">:</span>
                  <ScrollPicker value={minutes} min={0} max={59} onChange={setMinutes} label="Perc" />
                  <span className="text-2xl font-bold text-gray-200 dark:text-gray-600 mb-3">:</span>
                  <ScrollPicker value={secs} min={0} max={59} onChange={setSecs} label="Mp" />
                </div>

                <div className="flex gap-1.5 justify-center mb-4 flex-wrap">
                  {QUICK.map(q => (
                    <button key={q.label} onClick={() => {
                      setDays(Math.floor(q.s/86400));
                      setHours(Math.floor((q.s%86400)/3600));
                      setMinutes(Math.floor((q.s%3600)/60));
                      setSecs(q.s%60);
                    }}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-colors">
                      {q.label}
                    </button>
                  ))}
                </div>

                <button onClick={() => startTimer()}
                  className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-full font-semibold transition-colors mb-3">
                  Indítás
                </button>

                {savedTimers.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {savedTimers.map(t => (
                      <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <button onClick={() => startTimer(t.totalSeconds)} className="flex items-center gap-2 flex-1 text-left">
                          <span>{t.emoji}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{fmtSecs(t.totalSeconds)}</span>
                        </button>
                        <button onClick={() => {
                          const u = savedTimers.filter(x => x.id !== t.id);
                          setSavedTimers(u);
                          localStorage.setItem('savedTimers', JSON.stringify(u));
                        }} className="text-red-400 ml-2">×</button>
                      </div>
                    ))}
                  </div>
                )}

                {!showSave ? (
                  <button onClick={() => setShowSave(true)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                    + Mentés kedvencként
                  </button>
                ) : (
                  <div className="space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-left mt-2">
                    <input type="text" placeholder="Pl. Tojás főzés" value={saveName}
                      onChange={e => setSaveName(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    <div className="flex flex-wrap gap-1">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => setSaveEmoji(e)}
                          className={`text-lg p-1 rounded ${saveEmoji === e ? 'bg-orange-100 dark:bg-orange-900/30' : ''}`}>{e}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveTimerFn} className="flex-1 py-1.5 bg-orange-400 text-white rounded-lg text-sm">Mentés</button>
                      <button onClick={() => setShowSave(false)} className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Mégse</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <RingProgress percent={percent}>
                  {finished ? (
                    <div className="text-2xl font-bold text-orange-400 animate-bounce">✓ Kész!</div>
                  ) : (
                    <div>
                      <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white tabular-nums">
                        {fmtSecs(remaining!)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{fmtSecs(totalSet)}</div>
                    </div>
                  )}
                </RingProgress>

                <div className="flex gap-2 justify-center mt-4">
                  {!finished && (running ? (
                    <button onClick={pause} className="px-6 py-2.5 bg-gray-800 dark:bg-gray-600 text-white rounded-full text-sm font-medium">Szüneteltet</button>
                  ) : (
                    <button onClick={resume} className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-full text-sm font-medium">Folytatás</button>
                  ))}
                  <button onClick={reset} className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">Törlés</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'events' && (
          <div>
            <div className="space-y-3 mb-3">
              {events.filter(e => getCountdown(e.date) !== null)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(e => {
                  const cd = getCountdown(e.date);
                  return (
                    <div key={e.id} className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{e.emoji} {e.name}</span>
                        <button onClick={() => {
                          const u = events.filter(x => x.id !== e.id);
                          setEvents(u);
                          localStorage.setItem('countdownEvents', JSON.stringify(u));
                        }} className="text-red-400 text-lg">×</button>
                      </div>
                      {cd && (
                        <div className="grid grid-cols-4 gap-1 text-center">
                          {[{v:cd.days,l:'nap'},{v:cd.hours,l:'óra'},{v:cd.minutes,l:'perc'},{v:cd.seconds,l:'mp'}].map(({v,l}) => (
                            <div key={l} className="bg-white dark:bg-gray-600 rounded p-1">
                              <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">{String(v).padStart(2,'0')}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{l}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              {events.filter(e => getCountdown(e.date) === null).length === 0 && events.length === 0 && (
                <p className="text-center text-gray-400 text-sm">Nincs még esemény</p>
              )}
            </div>
            {!showEventForm ? (
              <button onClick={() => setShowEventForm(true)}
                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                + Új esemény
              </button>
            ) : (
              <div className="space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <input type="text" placeholder="Esemény neve" value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <input type="date" value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                <div className="flex flex-wrap gap-1">
                  {['🎯','✈️','🎓','🏖️','🎂','💍','🏆','🎪','🎬','🎵','⚽','🏠'].map(emoji => (
                    <button key={emoji} onClick={() => setNewEvent({...newEvent, emoji})}
                      className={`text-xl p-1 rounded ${newEvent.emoji === emoji ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}>{emoji}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addEvent} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">Mentés</button>
                  <button onClick={() => setShowEventForm(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Mégse</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}