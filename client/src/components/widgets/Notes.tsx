import * as React from 'react';
import { useState } from 'react';
import { Card } from '../../components/ui/card';

interface Note {
  id: string;
  text: string;
  color: string;
  createdAt: string;
}

const COLORS = [
  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
  'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
];

let globalFlipped = false;

function triggerFlip() {
  globalFlipped = !globalFlipped;
  const root = document.getElementById('root');
  if (root) {
    root.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    root.style.transform = globalFlipped ? 'rotate(180deg) scaleX(-1)' : 'rotate(0deg) scaleX(1)';
  }
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try { return JSON.parse(localStorage.getItem('quickNotes') || '[]'); } catch { return []; }
  });
  const [newText, setNewText] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  const checkEasterEgg = (text: string) => {
    if (text.toLowerCase().includes('bálint') || text.toLowerCase().includes('balint')) {
      triggerFlip();
      setFlipCount(c => c + 1);
    }
  };

  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem('quickNotes', JSON.stringify(updated));
  };

  const addNote = () => {
    if (!newText.trim()) return;
    checkEasterEgg(newText);
    const note: Note = {
      id: Date.now().toString(),
      text: newText.trim(),
      color: COLORS[colorIndex],
      createdAt: new Date().toLocaleDateString('hu-HU'),
    };
    saveNotes([note, ...notes]);
    setNewText('');
    setColorIndex((colorIndex + 1) % COLORS.length);
  };

  const deleteNote = (id: string) => saveNotes(notes.filter(n => n.id !== id));
  const displayed = showAll ? notes : notes.slice(0, 3);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div>
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase text-center">
          📝 Gyors jegyzetek
          {flipCount > 0 && <span className="ml-2 text-xs text-purple-400">🔄 ×{flipCount}</span>}
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNote()}
            placeholder="Írj egy rövid jegyzetet..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button onClick={addNote} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">+</button>
        </div>

        {notes.length === 0 && (
          <p className="text-center text-gray-400 text-sm">Még nincs jegyzet</p>
        )}

        <div className="space-y-2">
          {displayed.map(note => (
            <div key={note.id} className={`flex items-start justify-between p-3 rounded-lg border ${note.color}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 break-words">{note.text}</p>
                <p className="text-xs text-gray-400 mt-1">{note.createdAt}</p>
              </div>
              <button onClick={() => deleteNote(note.id)} className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0">×</button>
            </div>
          ))}
        </div>

        {notes.length > 3 && (
          <button onClick={() => setShowAll(!showAll)} className="w-full mt-2 text-xs text-indigo-500 hover:underline">
            {showAll ? '▲ Kevesebb' : `▼ Összes (${notes.length})`}
          </button>
        )}
      </div>
    </Card>
  );
}
