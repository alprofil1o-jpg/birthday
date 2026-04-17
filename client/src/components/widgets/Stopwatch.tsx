import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/card';

interface Lap {
  id: number;
  time: number;
  diff: number;
}

function sendSwMsg(msg: any) {
  navigator.serviceWorker?.ready.then(reg => reg.active?.postMessage(msg));
}

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef<number>(0);
  const intervalRef = useRef<any>(null);
  const lastLapRef = useRef<number>(0);
  const swIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(swIntervalRef.current);
    };
  }, []);

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
  };

  const fmtShort = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  // Send live notification every second while running
  const startSwNotification = () => {
    clearInterval(swIntervalRef.current);
    swIntervalRef.current = setInterval(() => {
      const currentElapsed = Date.now() - startRef.current;
      sendSwMsg({
        type: 'stopwatch-update',
        time: fmtShort(currentElapsed),
      });
    }, 1000);
  };

  const start = () => {
    startRef.current = Date.now() - elapsed;
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 10);
    setRunning(true);
    startSwNotification();
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    clearInterval(swIntervalRef.current);
    setRunning(false);
    // Send final notification with elapsed time
    sendSwMsg({
      type: 'stopwatch-stopped',
      time: fmt(elapsed),
    });
    // Also show local notification
    if (Notification.permission === 'granted') {
      new Notification('⏱️ Stopper megállítva', {
        body: `Mért idő: ${fmt(elapsed)}`,
        icon: '/icon-192.png',
        tag: 'stopwatch-result',
      });
    }
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    clearInterval(swIntervalRef.current);
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    lastLapRef.current = 0;
    sendSwMsg({ type: 'stopwatch-stop' });
  };

  const lap = () => {
    const diff = elapsed - lastLapRef.current;
    setLaps(prev => [{ id: prev.length + 1, time: elapsed, diff }, ...prev]);
    lastLapRef.current = elapsed;
  };

  const minLap = laps.length > 0 ? Math.min(...laps.map(l => l.diff)) : null;
  const maxLap = laps.length > 0 ? Math.max(...laps.map(l => l.diff)) : null;

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">⏱️ Stopper</h2>

        <div className="text-5xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-6 tabular-nums">
          {fmt(elapsed)}
        </div>

        <div className="flex gap-2 justify-center mb-4">
          {!running ? (
            <button onClick={start}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium text-sm transition-colors">
              {elapsed === 0 ? '▶ Start' : '▶ Folytat'}
            </button>
          ) : (
            <button onClick={stop}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium text-sm transition-colors">
              ⏸ Stop
            </button>
          )}
          {running && (
            <button onClick={lap}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-sm transition-colors">
              🏁 Kör
            </button>
          )}
          {!running && elapsed > 0 && (
            <button onClick={reset}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium text-sm transition-colors">
              ↺ Reset
            </button>
          )}
        </div>

        {laps.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1 text-left">
            {laps.map(lap => {
              let color = 'text-gray-600 dark:text-gray-400';
              if (lap.diff === minLap) color = 'text-green-600 dark:text-green-400 font-semibold';
              if (lap.diff === maxLap && laps.length > 1) color = 'text-red-500 dark:text-red-400';
              return (
                <div key={lap.id} className="flex justify-between px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                  <span className="text-gray-500 dark:text-gray-400">#{lap.id}</span>
                  <span className={`font-mono ${color}`}>{fmt(lap.diff)}</span>
                  <span className="font-mono text-gray-400">{fmt(lap.time)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
