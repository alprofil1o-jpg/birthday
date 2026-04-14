import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface QuizQuestion {
  question: string;
  answers: string[];
  correct: number;
  explanation: string;
}

const questions: QuizQuestion[] = [
  { question: 'Mikor alapították Budapestet a három város egyesítésével?', answers: ['1848', '1867', '1873', '1896'], correct: 2, explanation: 'Buda, Pest és Óbuda 1873-ban egyesült Budapest névvel.' },
  { question: 'Ki volt az első magyar király?', answers: ['I. Béla', 'I. István', 'I. László', 'II. András'], correct: 1, explanation: 'I. István 1000-ben koronázták meg az első magyar királynak.' },
  { question: 'Mi Magyarország fővárosa?', answers: ['Debrecen', 'Pécs', 'Budapest', 'Győr'], correct: 2, explanation: 'Budapest 1873 óta Magyarország fővárosa.' },
  { question: 'Melyik folyó nem folyik át Magyarországon?', answers: ['Duna', 'Tisza', 'Dráva', 'Rajna'], correct: 3, explanation: 'A Rajna Svájcban, Ausztriában és Németországban folyik.' },
  { question: 'Mikor szabadult fel Magyarország a szovjet uralom alól?', answers: ['1989', '1990', '1991', '1988'], correct: 0, explanation: '1989-ben omlott le a kommunista rendszer Magyarországon.' },
  { question: 'Ki írta a Himnuszt?', answers: ['Petőfi Sándor', 'Arany János', 'Kölcsey Ferenc', 'Vörösmarty Mihály'], correct: 2, explanation: 'Kölcsey Ferenc írta a Hymnust 1823-ban.' },
  { question: 'Melyik évben volt az 1956-os forradalom?', answers: ['1954', '1956', '1958', '1960'], correct: 1, explanation: '1956. október 23-án tört ki a magyar forradalom.' },
  { question: 'Hány megye van Magyarországon?', answers: ['17', '18', '19', '20'], correct: 2, explanation: 'Magyarországnak 19 megyéje és a főváros Budapest van.' },
  { question: 'Mi a Balaton másik neve?', answers: ['Magyar tenger', 'Alföldi tó', 'Pannon-tó', 'Dunántúli tó'], correct: 0, explanation: 'A Balatont a helyiek "Magyar tenger"-nek is hívják.' },
  { question: 'Ki volt Petőfi Sándor?', answers: ['Zenész', 'Festő', 'Költő', 'Politikus'], correct: 2, explanation: 'Petőfi Sándor a 19. század egyik legismertebb magyar költője.' },
  { question: 'Mikor lépett be Magyarország az Európai Unióba?', answers: ['2002', '2003', '2004', '2005'], correct: 2, explanation: 'Magyarország 2004. május 1-én csatlakozott az EU-hoz.' },
  { question: 'Mi a magyar néptánc neve?', answers: ['Csárdás', 'Polka', 'Keringő', 'Mazurka'], correct: 0, explanation: 'A csárdás a legismertebb hagyományos magyar néptánc.' },
  { question: 'Hol található a Hortobágy?', answers: ['Dunántúlon', 'Az Alföldön', 'A Mátrában', 'Somogyban'], correct: 1, explanation: 'A Hortobágy Magyarország legnagyobb alföldi pusztája.' },
  { question: 'Ki tervezte az Operaházat?', answers: ['Ybl Miklós', 'Lechner Ödön', 'Steindl Imre', 'Hauszmann Alajos'], correct: 0, explanation: 'Ybl Miklós tervezte a budapesti Operaházat, 1884-ben nyílt meg.' },
  { question: 'Mi a legmagasabb pont Magyarországon?', answers: ['Kékes', 'Mátra', 'Bükk', 'Pilis'], correct: 0, explanation: 'A Kékes (1014 m) a Mátrában Magyarország legmagasabb pontja.' },
  { question: 'Melyik évben volt Magyarország millenniuma?', answers: ['1869', '1886', '1896', '1906'], correct: 2, explanation: '1896-ban ünnepelték a honfoglalás 1000. évfordulóját.' },
  { question: 'Ki volt az 1956-os forradalom egyik vezető alakja?', answers: ['Kádár János', 'Nagy Imre', 'Rákosi Mátyás', 'Horthy Miklós'], correct: 1, explanation: 'Nagy Imre volt a forradalom idején a miniszterelnök.' },
  { question: 'Melyik magyar találmány a Rubik-kocka?', answers: ['Igen', 'Nem'], correct: 0, explanation: 'Rubik Ernő magyar feltaláló alkotta meg 1974-ben.' },
  { question: 'Mi a magyar „pálinka"?', answers: ['Bor', 'Sör', 'Gyümölcspárlat', 'Mézes ital'], correct: 2, explanation: 'A pálinka hagyományos magyar gyümölcspárlat, védett eredetjelzéssel.' },
  { question: 'Hány aranyérmet nyert Magyarország az összes olimpián?', answers: ['Több mint 150', 'Körülbelül 50', 'Körülbelül 100', 'Kevesebb mint 50'], correct: 0, explanation: 'Magyarország több mint 170 olimpiai aranyérmet szerzett, ami kiemelkedő eredmény.' },
];

export default function DailyQuiz() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setQuestion(questions[dayOfYear % questions.length]);

    // Check if already answered today
    const savedDate = localStorage.getItem('quizDate');
    const savedAnswer = localStorage.getItem('quizAnswer');
    if (savedDate === today.toISOString().split('T')[0] && savedAnswer !== null) {
      setSelected(parseInt(savedAnswer));
      setShowExplanation(true);
    }
  }, []);

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowExplanation(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('quizDate', today);
    localStorage.setItem('quizAnswer', String(index));
  };

  if (!question) return null;

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div>
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase text-center">🎯 Napi kvíz</h2>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4 text-center">{question.question}</p>

        <div className="space-y-2">
          {question.answers.map((answer, i) => {
            let style = 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200';
            if (selected !== null) {
              if (i === question.correct) style = 'bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-800 dark:text-green-300 font-semibold';
              else if (i === selected) style = 'bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-800 dark:text-red-300';
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${style} ${selected === null ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer' : 'cursor-default'}`}>
                {String.fromCharCode(65 + i)}. {answer}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {selected === question.correct ? '✅ Helyes! ' : '❌ Helytelen. '}
              {question.explanation}
            </p>
          </div>
        )}

        {selected === null && (
          <p className="text-xs text-center text-gray-400 mt-3">Naponta egy új kérdés!</p>
        )}
      </div>
    </Card>
  );
}
