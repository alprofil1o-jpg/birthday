import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import Clock from '../components/widgets/Clock';
import BirthdayCountdown from '../components/widgets/BirthdayCountdown';
import Weather from '../components/widgets/Weather';
import DailyJoke from '../components/widgets/DailyJoke';
import NameDay from '../components/widgets/NameDay';
import AgeCounter from '../components/widgets/AgeCounter';
import Holidays from '../components/widgets/Holidays';
import CountdownEvent from '../components/widgets/CountdownEvent';
import Notes from '../components/widgets/Notes';
import OnThisDay from '../components/widgets/OnThisDay';
import DailyQuiz from '../components/widgets/DailyQuiz';
import Stopwatch from '../components/widgets/Stopwatch';
import NotificationsWidget from '../components/widgets/NotificationsWidget';
import AppSettings from '../components/widgets/AppSettings';
import NotificationSettings from './NotificationSettings';
import { Button } from '../components/ui/button';

interface DashboardProps {
  birthday: string;
  onChangeBirthday: (date: string) => void;
}

const DEFAULT_ORDER = [
  'clock', 'birthday', 'weather', 'nameday', 'age',
  'notifications', 'holidays', 'onthisday', 'quiz',
  'countdown', 'stopwatch', 'notes', 'settings', 'joke',
];

const WIDGET_LABELS: Record<string, string> = {
  clock: '🕐 Óra', birthday: '🎂 Születésnap számláló', weather: '🌤 Időjárás',
  nameday: '👤 Névnap', age: '🎂 Életkor', notifications: '⚙️ Beállítások',
  holidays: '🎉 Ünnepek', onthisday: '📰 Ezen a napon', quiz: '🎯 Napi kvíz',
  countdown: '⏰ Időzítő', stopwatch: '⏱️ Stopper', notes: '📝 Jegyzetek',
  settings: 'ℹ️ Információk', joke: '😄 Napi vicc',
};

export default function Dashboard({ birthday, onChangeBirthday }: DashboardProps) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('widgetOrder');
      if (saved) {
        const parsed = JSON.parse(saved);
        const missing = DEFAULT_ORDER.filter(w => !parsed.includes(w));
        return [...parsed, ...missing];
      }
    } catch {}
    return DEFAULT_ORDER;
  });

  const [editMode, setEditMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [hidden, setHidden] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hiddenWidgets') || '[]'); } catch { return []; }
  });

  // Pull to refresh
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pulling = useRef(false);
  const THRESHOLD = 80;
  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (meta) meta.content = isDark ? '#111827' : '#eef2ff';
  }, [isDark]);

  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'contain';
    return () => { document.body.style.overscrollBehaviorY = ''; };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) { touchStartY.current = e.touches[0].clientY; pulling.current = true; }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || isRefreshing) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0 && window.scrollY === 0) { e.preventDefault(); setPullDistance(Math.min(dy * 0.5, THRESHOLD + 20)); }
  };
  const onTouchEnd = () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD) { setIsRefreshing(true); setPullDistance(THRESHOLD); setTimeout(() => window.location.reload(), 1000); }
    else setPullDistance(0);
  };

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleChangeBirthday = () => {
    localStorage.removeItem('userBirthday');
    onChangeBirthday('');
  };

  const saveOrder = (order: string[]) => { setWidgetOrder(order); localStorage.setItem('widgetOrder', JSON.stringify(order)); };
  const saveHidden = (h: string[]) => { setHidden(h); localStorage.setItem('hiddenWidgets', JSON.stringify(h)); };

  const handleDragStart = (id: string) => { dragItem.current = id; };
  const handleDragEnter = (id: string) => { dragOver.current = id; };
  const handleDragEnd = () => {
    if (!dragItem.current || !dragOver.current || dragItem.current === dragOver.current) return;
    const newOrder = [...widgetOrder];
    const fromIdx = newOrder.indexOf(dragItem.current);
    const toIdx = newOrder.indexOf(dragOver.current);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragItem.current);
    saveOrder(newOrder);
    dragItem.current = null;
    dragOver.current = null;
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'clock': return <Clock />;
      case 'birthday': return <BirthdayCountdown birthday={birthday} />;
      case 'weather': return <Weather />;
      case 'nameday': return <NameDay birthday={birthday} />;
      case 'age': return <AgeCounter birthday={birthday} />;
      case 'notifications': return <NotificationsWidget birthday={birthday} />;
      case 'holidays': return <Holidays />;
      case 'onthisday': return <OnThisDay />;
      case 'quiz': return <DailyQuiz />;
      case 'countdown': return <CountdownEvent birthday={birthday} />;
      case 'stopwatch': return <Stopwatch />;
      case 'notes': return <div className="md:col-span-2"><Notes birthday={birthday} /></div>;
      case 'settings': return <AppSettings birthday={birthday} />;
      case 'joke': return <div className="lg:col-span-3"><DailyJoke /></div>;
      default: return null;
    }
  };

  const pullProgress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <>
      {/* Pull-to-refresh indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden"
        style={{ height: pullDistance > 0 || isRefreshing ? Math.max(pullDistance, isRefreshing ? 60 : 0) : 0 }}>
        <div style={{
          fontSize: 32 + pullProgress * 16, opacity: pullProgress,
          transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)`,
          animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none',
        }}>
          {pullDistance > 30 ? '🎂' : '↓'}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div
        className="min-h-screen p-4 pt-safe transition-colors duration-300"
        style={{
          background: isDark ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' : 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pulling.current ? 'none' : 'transform 0.3s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Születésnapi Számláló</h1>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditMode(!editMode)}
                  className={`p-2 rounded-full border text-lg hover:scale-110 transition-all flex-shrink-0 ${editMode ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                  ✏️
                </button>
                <button onClick={toggleDark}
                  className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl hover:scale-110 transition-transform flex-shrink-0">
                  {isDark ? '☀️' : '🌙'}
                </button>
                <button onClick={() => setShowInfo(true)}
                  className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl hover:scale-110 transition-transform flex-shrink-0">
                  ℹ️
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <NotificationSettings birthday={birthday} />
              <Button onClick={handleChangeBirthday} variant="outline" className="text-sm">
                Születésnap Módosítása
              </Button>
            </div>
          </div>

          {/* Edit mode */}
          {editMode && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Widget sorrend — húzd át, kapcsold ki/be</p>
              <div className="space-y-2">
                {widgetOrder.map((id) => (
                  <div key={id} draggable
                    onDragStart={() => handleDragStart(id)}
                    onDragEnter={() => handleDragEnter(id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => e.preventDefault()}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-grab transition-colors ${hidden.includes(id) ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 opacity-50' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">☰</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{WIDGET_LABELS[id]}</span>
                    </div>
                    <button onClick={() => saveHidden(hidden.includes(id) ? hidden.filter(h => h !== id) : [...hidden, id])}
                      className={`text-xs px-2 py-1 rounded-full ${hidden.includes(id) ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400' : 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'}`}>
                      {hidden.includes(id) ? 'Elrejtve' : 'Látható'}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => { saveOrder(DEFAULT_ORDER); saveHidden([]); }}
                className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
                Visszaállítás alapértelmezettre
              </button>
            </div>
          )}

          {/* Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgetOrder.filter(id => !hidden.includes(id)).map(id => (
              <React.Fragment key={id}>{renderWidget(id)}</React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Info modal */}
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
    </>
  );
}
