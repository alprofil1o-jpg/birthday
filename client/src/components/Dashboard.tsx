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
import NotificationSettings from './NotificationSettings';
import { Button } from '../components/ui/button';

interface DashboardProps {
  birthday: string;
  onChangeBirthday: (date: string) => void;
}

const DEFAULT_ORDER = [
  'clock', 'birthday', 'weather', 'nameday', 'age',
  'holidays', 'onthisday', 'quiz', 'countdown', 'stopwatch', 'notes', 'joke',
];

const WIDGET_LABELS: Record<string, string> = {
  clock: '🕐 Óra',
  birthday: '🎂 Születésnap számláló',
  weather: '🌤 Időjárás',
  nameday: '👤 Névnap',
  age: '🎂 Életkor',
  holidays: '🎉 Ünnepek',
  onthisday: '📰 Ezen a napon',
  quiz: '🎯 Napi kvíz',
  countdown: '⏱ Visszaszámlálók',
  stopwatch: '⏱️ Stopper',
  notes: '📝 Jegyzetek',
  joke: '😄 Napi vicc',
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
        // Add any new widgets not in saved order
        const missing = DEFAULT_ORDER.filter(w => !parsed.includes(w));
        return [...parsed, ...missing];
      }
    } catch {}
    return DEFAULT_ORDER;
  });

  const [editMode, setEditMode] = useState(false);
  const [hidden, setHidden] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hiddenWidgets') || '[]'); } catch { return []; }
  });

  const dragItem = useRef<string | null>(null);
  const dragOver = useRef<string | null>(null);

  // Update theme-color meta tag dynamically
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (meta) meta.content = isDark ? '#111827' : '#eef2ff';
    document.documentElement.style.setProperty('--app-bg', isDark ? '#111827' : '#eef2ff');
  }, [isDark]);

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

  const saveOrder = (order: string[]) => {
    setWidgetOrder(order);
    localStorage.setItem('widgetOrder', JSON.stringify(order));
  };

  const saveHidden = (h: string[]) => {
    setHidden(h);
    localStorage.setItem('hiddenWidgets', JSON.stringify(h));
  };

  const toggleHidden = (id: string) => {
    const updated = hidden.includes(id) ? hidden.filter(h => h !== id) : [...hidden, id];
    saveHidden(updated);
  };

  // Drag & drop handlers
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

  // Touch drag for mobile
  const touchStartY = useRef<number>(0);
  const touchItemId = useRef<string | null>(null);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'clock': return <Clock />;
      case 'birthday': return <BirthdayCountdown birthday={birthday} />;
      case 'weather': return <Weather />;
      case 'nameday': return <NameDay birthday={birthday} />;
      case 'age': return <AgeCounter birthday={birthday} />;
      case 'holidays': return <Holidays />;
      case 'onthisday': return <OnThisDay />;
      case 'quiz': return <DailyQuiz />;
      case 'countdown': return <CountdownEvent />;
      case 'stopwatch': return <Stopwatch />;
      case 'notes': return <div className="md:col-span-2"><Notes /></div>;
      case 'joke': return <div className="lg:col-span-3"><DailyJoke /></div>;
      default: return null;
    }
  };

  return (
    <div
      className="min-h-screen p-4 pt-safe transition-colors duration-300"
      style={{ background: isDark ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' : 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Születésnapi Számláló</h1>
            <div className="flex items-center gap-2">
              {/* Edit mode toggle */}
              <button
                onClick={() => setEditMode(!editMode)}
                title="Widget sorrend szerkesztése"
                className={`p-2 rounded-full border text-lg hover:scale-110 transition-all flex-shrink-0 ${
                  editMode
                    ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                ✏️
              </button>
              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl hover:scale-110 transition-transform flex-shrink-0"
                title={isDark ? 'Világos mód' : 'Sötét mód'}
              >
                {isDark ? '☀️' : '🌙'}
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

        {/* Edit mode panel */}
        {editMode && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Widget sorrend — húzd át a sorrendet, kapcsold ki/be
            </p>
            <div className="space-y-2">
              {widgetOrder.map((id) => (
                <div
                  key={id}
                  draggable
                  onDragStart={() => handleDragStart(id)}
                  onDragEnter={() => handleDragEnter(id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => e.preventDefault()}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
                    hidden.includes(id)
                      ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 opacity-50'
                      : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">☰</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{WIDGET_LABELS[id]}</span>
                  </div>
                  <button
                    onClick={() => toggleHidden(id)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      hidden.includes(id)
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                        : 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {hidden.includes(id) ? 'Elrejtve' : 'Látható'}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => { saveOrder(DEFAULT_ORDER); saveHidden([]); }}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Visszaállítás alapértelmezettre
            </button>
          </div>
        )}

        {/* Widget grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgetOrder
            .filter(id => !hidden.includes(id))
            .map(id => (
              <React.Fragment key={id}>
                {renderWidget(id)}
              </React.Fragment>
            ))
          }
        </div>
      </div>
    </div>
  );
}
