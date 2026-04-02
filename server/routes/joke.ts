interface JokeResponse {
  setup: string;
  delivery: string;
}

const jokes: JokeResponse[] = [
  { setup: 'Miért jó lenni magyar programozónak?', delivery: 'Mert nem kell tanulnod angol szlengeket, ha hibákba futnak bele!' },
  { setup: 'Hány magyarországi IT-s kell egy villanykörtét becsavarni?', delivery: 'Hárommal kezdjük az intézetet, de aztán felrohan az ezres szám!' },
  { setup: 'Miért szeretik a programozók a magyar konyhát?', delivery: 'Mert mindig van egy új "forrás" (loop) az evéshez!' },
  { setup: 'Mit mondott a magyar programozó a bugnak?', delivery: '"Szíjas vagy, de én letiltom a GitHub-ot!"' },
  { setup: 'Miért szeretik a magyar fejlesztők az éjszakát?', delivery: 'Mert amikor nincs világítás, kevés a szúnyog (bug) is!' },
  { setup: 'Hogyan éneklik a magyar programozók?', delivery: 'Mindig C# vagy bassz! (C-sáv vagy basszus)' },
  { setup: 'Miért ment ki a magyar fejlesztő a vízre?', delivery: 'Hogy megpróbálja debugolni a kódját sósvízzel!' },
  { setup: 'Mi a magyar fejlesztő kedvenc közhelye?', delivery: 'A Bár (Bar) - de nem az, amire gondolsz!' },
  { setup: 'Miért visel szemüveget a magyar Java programozó?', delivery: 'Mert a Java nem C# - és ez a szövetsége!' },
  { setup: 'Egy SQL lekérdezés bemegy egy magyar kocsmába...', delivery: 'Felkiált: "Összekapcsolódhatunk az asztalokkal?"' },
];

export async function getJoke(): Promise<JokeResponse> {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return jokes[dayOfYear % jokes.length];
}
