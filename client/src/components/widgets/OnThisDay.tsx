import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

const events: Record<string, { year: number; event: string }[]> = {
  '1-1': [{ year: 1801, event: 'Első kisbolygót, a Cerest fedezi fel Giuseppe Piazzi.' }, { year: 1993, event: 'Csehország és Szlovákia szétválik.' }],
  '1-6': [{ year: 1912, event: 'New-Mexikó az USA 47. állama lesz.' }],
  '1-14': [{ year: 1954, event: 'Marilyn Monroe és Joe DiMaggio összeházsodik.' }],
  '1-15': [{ year: 1929, event: 'Megszületik Martin Luther King Jr.' }, { year: 2001, event: 'Elindul a Wikipedia.' }],
  '1-27': [{ year: 1945, event: 'Szovjet csapatok felszabadítják Auschwitzot.' }, { year: 1756, event: 'Megszületik Wolfgang Amadeus Mozart.' }],
  '2-4': [{ year: 2004, event: 'Mark Zuckerberg elindítja a Facebookot.' }],
  '2-11': [{ year: 1990, event: 'Nelson Mandela szabadul a börtönből.' }],
  '2-14': [{ year: 1876, event: 'Alexander Graham Bell benyújtja a telefon szabadalmát.' }],
  '3-6': [{ year: 1475, event: 'Megszületik Michelangelo.' }],
  '3-14': [{ year: 1879, event: 'Megszületik Albert Einstein.' }, { year: 2018, event: 'Elhunyt Stephen Hawking.' }],
  '3-15': [{ year: 1848, event: 'Kitör a magyar forradalom.' }],
  '4-1': [{ year: 1976, event: 'Steve Jobs és Steve Wozniak megalapítják az Apple-t.' }],
  '4-12': [{ year: 1961, event: 'Jurij Gagarin az első ember az űrben.' }],
  '4-15': [{ year: 1452, event: 'Megszületik Leonardo da Vinci.' }, { year: 1912, event: 'Elsüllyed a Titanic.' }],
  '4-22': [{ year: 1970, event: 'Az első Föld napja.' }],
  '4-23': [{ year: 1616, event: 'Meghal William Shakespeare.' }],
  '5-1': [{ year: 1851, event: 'Megnyílik a londoni Kristálypalota.' }],
  '5-4': [{ year: 1979, event: 'Margaret Thatcher lesz Nagy-Britannia első női miniszterelnöke.' }],
  '5-9': [{ year: 1945, event: 'Véget ér a második világháború Európában.' }],
  '5-25': [{ year: 1977, event: 'Bemutatják a Csillagok háborúját.' }],
  '6-6': [{ year: 1944, event: 'D-Day: szövetséges partraszállás Normandiában.' }],
  '6-21': [{ year: 1788, event: 'Az USA alkotmánya hatályba lép.' }],
  '7-4': [{ year: 1776, event: 'Az USA kinyilvánítja függetlenségét.' }],
  '7-11': [{ year: 1960, event: 'Megjelenik a Ne bántsátok a feketerigót.' }],
  '7-20': [{ year: 1969, event: 'Neil Armstrong elsőként lép a Holdra.' }],
  '8-4': [{ year: 1944, event: 'Anne Frankot letartóztatják.' }],
  '8-6': [{ year: 1945, event: 'Ledobják az első atombombát Hirosimára.' }],
  '8-12': [{ year: 1981, event: 'Az IBM piacra dobja az első PC-t.' }],
  '8-20': [{ year: 1000, event: 'I. István megkoronázása, Magyarország keresztény állam lesz.' }],
  '9-1': [{ year: 1939, event: 'Németország megtámadja Lengyelországot — kitör a II. világháború.' }],
  '9-11': [{ year: 2001, event: 'Terrortámadás New Yorkban.' }],
  '10-4': [{ year: 1957, event: 'Fellövik az első műholdat, a Szputnyikot.' }],
  '10-12': [{ year: 1492, event: 'Kolumbusz Kristóf eléri Amerikát.' }],
  '10-23': [{ year: 1956, event: 'Kitör a magyar forradalom.' }],
  '11-9': [{ year: 1989, event: 'Leomlik a berlini fal.' }],
  '11-19': [{ year: 1863, event: 'Lincoln elmondja a Gettysburgi beszédet.' }],
  '12-17': [{ year: 1903, event: 'A Wright fivérek első repülése.' }],
  '12-25': [{ year: 1991, event: 'Feloszlik a Szovjetunió.' }],
  '12-31': [{ year: 1999, event: 'Oroszország elnöke Putyin lesz.' }],
};

export default function OnThisDay() {
  const [todayEvents, setTodayEvents] = useState<{ year: number; event: string }[]>([]);
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    const today = new Date();
    const key = `${today.getMonth() + 1}-${today.getDate()}`;
    setTodayEvents(events[key] || []);
    setDateLabel(today.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' }));
  }, []);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div>
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase text-center">📰 Ezen a napon</h2>
        <p className="text-xs text-center text-gray-400 mb-4">{dateLabel}</p>

        {todayEvents.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">Nincs ismert esemény mára.</p>
        ) : (
          <div className="space-y-3">
            {todayEvents.map((e, i) => (
              <div key={i} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">{e.year}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{e.event}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
