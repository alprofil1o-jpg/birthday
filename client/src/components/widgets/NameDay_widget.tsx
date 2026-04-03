import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';

interface NameDayData { name: string; date: string; }

const nameDays: { [key: string]: string } = {
  '1-1':'Újév','1-2':'Balázs','1-3':'Genovéva','1-4':'Angéla','1-5':'Sándor','1-6':'Valkó','1-7':'Ramona','1-8':'Severus','1-9':'Márton','1-10':'Vilmos',
  '1-11':'Ottó','1-12':'Tátjána','1-13':'Hilbregundis','1-14':'Félix','1-15':'Móric','1-16':'Marcell','1-17':'Antal','1-18':'Priszka','1-19':'Henrik','1-20':'Fábián',
  '1-21':'Ágnes','1-22':'Vince','1-23':'Bernát','1-24':'Timótea','1-25':'Pál','1-26':'Paula','1-27':'Angéla','1-28':'Tamás','1-29':'Gellért','1-30':'Marcellia','1-31':'János',
  '2-1':'Bridget','2-2':'Gyertyaszentelő','2-3':'Balázs','2-4':'Róza','2-5':'Ágota','2-6':'Dorottya','2-7':'Richárd','2-8':'Arzenál','2-9':'Apollónia','2-10':'Scolasztika',
  '2-11':'Meghallgatás','2-12':'Eulália','2-13':'Beatrix','2-14':'Bálint','2-15':'Fausztusz','2-16':'Onézzimusz','2-17':'Sámuel','2-18':'Simeon','2-19':'Konrád','2-20':'Leó',
  '2-21':'Péter','2-22':'Péter szék','2-23':'Polikarp','2-24':'Mátyás','2-25':'Valburga','2-26':'Sándor','2-27':'Gábor','2-28':'Oszvald','2-29':'Oszvald',
  '3-1':'Dávid','3-2':'Csaba','3-3':'Kunigunda','3-4':'Kazimír','3-5':'Fokasz','3-6':'Koletta','3-7':'Perpetua','3-8':'János','3-9':'Gergely','3-10':'Makarius',
  '3-11':'Konstantin','3-12':'Gergely','3-13':'Gerhard','3-14':'Matild','3-15':'Klément','3-16':'Heribert','3-17':'Patrik','3-18':'Cirill','3-19':'József','3-20':'Kutbert',
  '3-21':'Serapión','3-22':'Miklós','3-23':'Ottó','3-24':'Katalin','3-25':'Angyali üdvözlet','3-26':'Ludger','3-27':'János','3-28':'Guntrám','3-29':'Jónás','3-30':'János','3-31':'Benjámin',
  '4-1':'Hugó','4-2':'Ferenc','4-3':'Richárd','4-4':'Izidor','4-5':'Vince','4-6':'Marcellin','4-7':'János','4-8':'Dionisz','4-9':'Valtraud','4-10':'Ezékiel',
  '4-11':'Stanislas','4-12':'Július','4-13':'Márton','4-14':'Tiburc','4-15':'Anasztázia','4-16':'Drogó','4-17':'Anicet','4-18':'Apolóniusz','4-19':'Alfeg','4-20':'Fotográfia napja',
  '4-21':'Anzelm','4-22':'Teodor','4-23':'György','4-24':'Melitus','4-25':'Márk','4-26':'Richár','4-27':'Zita','4-28':'Vitális','4-29':'Katalin','4-30':'Pius',
  '5-1':'Fülöp és János','5-2':'Atanáz','5-3':'Sándor','5-4':'Mónika','5-5':'Hilár','5-6':'János','5-7':'Flóra','5-8':'Desiderius','5-9':'Geroncius','5-10':'Antoninus',
  '5-11':'Mamertusz','5-12':'Nereida','5-13':'Róbert','5-14':'Mátyás','5-15':'Izidor','5-16':'Honorátu','5-17':'János','5-18':'János','5-19':'Dunsztan','5-20':'Bernardin',
  '5-21':'Konstantin','5-22':'Rita','5-23':'Desziderius','5-24':'Dávid','5-25':'Aldwin','5-26':'Fülöp','5-27':'Béda','5-28':'Ágoston','5-29':'Maximin','5-30':'Ferdinánd','5-31':'Mechtild',
  '6-1':'Iusztin','6-2':'Erasmus','6-3':'Klotild','6-4':'Optátusz','6-5':'Bonifác','6-6':'Norbert','6-7':'Róbert','6-8':'Medárd','6-9':'Primus','6-10':'Margit',
  '6-11':'Barnabás','6-12':'Onuphrius','6-13':'Antal','6-14':'Vazul','6-15':'Vitus','6-16':'János','6-17':'Nikander','6-18':'Leontius','6-19':'Gervác','6-20':'Metódius',
  '6-21':'Alojziusz','6-22':'Paulin','6-23':'Elek','6-24':'János születése','6-25':'Febrónia','6-26':'Vigilancia','6-27':'László','6-28':'Iréneusz','6-29':'Péter és Pál','6-30':'Pál vértanú',
  '7-1':'Tihamér','7-2':'Ottó','7-3':'Tamás','7-4':'András','7-5':'Antal','7-6':'Mária Goretti','7-7':'Pálladius','7-8':'Erzsébet','7-9':'Ágoston','7-10':'Amelberga',
  '7-11':'Benedek','7-12':'János','7-13':'Henrik','7-14':'Kamillusz','7-15':'Vladimír','7-16':'Mária Magdolna','7-17':'Enyheld','7-18':'Frigyes','7-19':'Vince','7-20':'Margit',
  '7-21':'Praxéd','7-22':'Mária Magdolna','7-23':'Apollináris','7-24':'Kinga','7-25':'Jakab','7-26':'Erzsébet','7-27':'Pantaleon','7-28':'Sámson','7-29':'Beatrix','7-30':'Abdon','7-31':'Ignác',
  '8-1':'Péter','8-2':'István','8-3':'Lídia','8-4':'Domonkos','8-5':'Ábel','8-6':'Berta','8-7':'Donátusz','8-8':'Emídius','8-9':'Román','8-10':'Lőrinc',
  '8-11':'Zsuzsanna','8-12':'Klára','8-13':'Ipoly','8-14':'Euszébius','8-15':'Mária mennybemenetele','8-16':'Rókus','8-17':'Myron','8-18':'Ilona','8-19':'János','8-20':'István',
  '8-21':'Privátusz','8-22':'Szimforián','8-23':'Klaudius','8-24':'Bertalan','8-25':'Lajos','8-26':'Zefirinus','8-27':'Mónika','8-28':'Ágoston','8-29':'Sabína','8-30':'Pammachus','8-31':'Paulin',
  '9-1':'Egyed','9-2':'István','9-3':'Gergely','9-4':'Mózes','9-5':'Herkulanus','9-6':'Zakeus','9-7':'Regina','9-8':'Mária születése','9-9':'Izsák','9-10':'Miklós',
  '9-11':'Jacint','9-12':'Mária','9-13':'Maurilusz','9-14':'Kereszt felmagasztalása','9-15':'Katalin','9-16':'Kornél','9-17':'Hildegárd','9-18':'József','9-19':'Január','9-20':'Eusztác',
  '9-21':'Máté','9-22':'Mór','9-23':'Linus','9-24':'Gérard','9-25':'Firmin','9-26':'Kozmás','9-27':'Kozmás és Damján','9-28':'Vencel','9-29':'Mihály','9-30':'Jeromos',
  '10-1':'Remigius','10-2':'Őrangyalok','10-3':'Dioníz','10-4':'Ferenc','10-5':'Flóra','10-6':'Brúnó','10-7':'Jusztina','10-8':'Pelágia','10-9':'Dioníz','10-10':'Ferenc',
  '10-11':'Sándor','10-12':'Wilfrid','10-13':'Eduárd','10-14':'Kallixtusz','10-15':'Gál','10-16':'Gérard','10-17':'Ignác','10-18':'Lukács','10-19':'János','10-20':'Vendel',
  '10-21':'Hilarión','10-22':'Donátusz','10-23':'János','10-24':'Antal','10-25':'Frumenciusz','10-26':'Demeter','10-27':'Szabina','10-28':'Simon és Júdás','10-29':'Nárcisz','10-30':'Marcellusz','10-31':'Farkas',
  '11-1':'Mindenszentek','11-2':'Halottak napja','11-3':'Hubertusz','11-4':'Károly','11-5':'Imre','11-6':'Lénárd','11-7':'Willibrord','11-8':'Vilmos','11-9':'Tivadar','11-10':'Leó',
  '11-11':'Márton','11-12':'Jozafát','11-13':'Szaniszló','11-14':'Laurencia','11-15':'Albert','11-16':'Ödön','11-17':'Erzsébet','11-18':'Róza','11-19':'Erzsébet','11-20':'Ede',
  '11-21':'Mária bemutatása','11-22':'Cecília','11-23':'Klément','11-24':'Flóra','11-25':'Katalin','11-26':'Lénárd','11-27':'Virgil','11-28':'Jakab','11-29':'Szaturninus','11-30':'András',
  '12-1':'Elza','12-2':'Bibiana','12-3':'Ferenc','12-4':'Borbála','12-5':'Vilma','12-6':'Miklós','12-7':'Ambrus','12-8':'Mária fogantatása','12-9':'Natália','12-10':'Judit',
  '12-11':'Árpád','12-12':'Gabriella','12-13':'Luca','12-14':'Szpiridion','12-15':'Valér','12-16':'Etelka','12-17':'Lázár','12-18':'Auguszta','12-19':'Viola','12-20':'Teofil',
  '12-21':'Tamás','12-22':'Zénó','12-23':'Viktória','12-24':'Ádám és Éva','12-25':'Karácsony','12-26':'István','12-27':'János','12-28':'Aprószentek','12-29':'Tamás','12-30':'Dávid','12-31':'Szilveszter',
};

function getNextNameDay(name: string) {
  const today = new Date();
  for (const [key, val] of Object.entries(nameDays)) {
    if (val.toLowerCase().includes(name.toLowerCase())) {
      const [m, d] = key.split('-').map(Number);
      const isToday = today.getMonth()+1 === m && today.getDate() === d;
      if (isToday) return { daysUntil: 0, date: `${m}. ${d}.` };
      let next = new Date(today.getFullYear(), m-1, d);
      if (next <= today) next = new Date(today.getFullYear()+1, m-1, d);
      const diff = Math.ceil((next.getTime() - today.getTime()) / (1000*60*60*24));
      return { daysUntil: diff, date: `${m}. ${d}.` };
    }
  }
  return null;
}

export default function NameDay() {
  const [nameDay, setNameDay] = useState<NameDayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedNames, setSavedNames] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedNameDays') || '[]'); } catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);
  const [inputName, setInputName] = useState('');

  const nextNameDay = React.useMemo(() => {
    if (savedNames.length === 0) return null;
    let closest: { name: string; daysUntil: number; date: string } | null = null;
    for (const name of savedNames) {
      const r = getNextNameDay(name);
      if (r && (!closest || r.daysUntil < closest.daysUntil)) closest = { name, ...r };
    }
    return closest;
  }, [savedNames]);

  useEffect(() => {
    fetch('/api/nameday')
      .then(r => r.json())
      .then(data => setNameDay(data))
      .catch(() => setNameDay({ name: 'Ismeretlen', date: new Date().toLocaleDateString() }))
      .finally(() => setLoading(false));
    const i = setInterval(() => {
      fetch('/api/nameday').then(r => r.json()).then(setNameDay).catch(() => {});
    }, 3600000);
    return () => clearInterval(i);
  }, []);

  const addName = () => {
    const t = inputName.trim();
    if (!t || savedNames.includes(t)) return;
    const updated = [...savedNames, t];
    setSavedNames(updated);
    localStorage.setItem('savedNameDays', JSON.stringify(updated));
    setInputName('');
  };

  const removeName = (name: string) => {
    const updated = savedNames.filter(n => n !== name);
    setSavedNames(updated);
    localStorage.setItem('savedNameDays', JSON.stringify(updated));
  };

  if (loading || !nameDay) {
    return (
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">Mai Névnap</h2>
        <p className="text-gray-600 dark:text-gray-400">Betöltés...</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase">Mai Névnap</h2>
          <div className="text-4xl mb-1">👤</div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{nameDay.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{nameDay.date}</p>

          {nextNameDay && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Következő névnap</p>
              <p className="font-bold text-purple-600 dark:text-purple-400">{nextNameDay.name}</p>
              {nextNameDay.daysUntil === 0
                ? <p className="text-sm text-pink-500 font-semibold">🎉 Ma van!</p>
                : <p className="text-sm text-gray-600 dark:text-gray-400">{nextNameDay.daysUntil} nap múlva ({nextNameDay.date})</p>
              }
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="text-sm px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition-colors"
          >
            👥 Névnapok kezelése
          </button>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Névnapok</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addName()}
                placeholder="Pl. Bálint"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button onClick={addName} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">+</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedNames.length === 0 && <p className="text-sm text-gray-500 text-center">Még nincs mentett név</p>}
              {savedNames.map(name => {
                const nd = getNextNameDay(name);
                return (
                  <div key={name} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                      {nd && <p className="text-xs text-gray-500 dark:text-gray-400">{nd.daysUntil === 0 ? '🎉 Ma!' : `${nd.daysUntil} nap (${nd.date})`}</p>}
                    </div>
                    <button onClick={() => removeName(name)} className="text-red-400 hover:text-red-600 text-lg ml-2">×</button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              Bezárás
            </button>
          </div>
        </div>
      )}
    </>
  );
}
