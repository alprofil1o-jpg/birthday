interface JokeResponse {
  setup: string;
  delivery: string;
}

const jokes: JokeResponse[] = [
  { setup: 'Mi a különbség a rossz és a jó tanár között?', delivery: 'A rossz tanár megmondja az igazságot. A jó tanár azt is elhiteti veled.' },
  { setup: 'Bemegy egy férfi a fodrászhoz és azt mondja: "Kérek egy hajvágást!"', delivery: 'A fodrász: "Melyiket?" — "Mindkettőt!"' },
  { setup: 'Miért nem játszik az elefánt kártyát a dzsungelben?', delivery: 'Mert túl sok leopárd van ott!' },
  { setup: 'Mit mond a nulla a nyolcasnak?', delivery: 'Szép öved van!' },
  { setup: 'Találkozik két tehén a réten. Az egyik azt mondja:', delivery: '"Nem félsz a kergemarhakórtól?" A másik: "Dehogynem, én vagyok az a ló!"' },
  { setup: 'Miért nem mesél az ajtó vicceket?', delivery: 'Mert mindig becsapják!' },
  { setup: 'Egy kisfiú megkérdezi az apját: "Apa, mi az a politika?"', delivery: 'Az apa: "Én vagyok a kenyérkereső, anyád a pénzt kezeli, a nagymama a törvény, a dada gondoskodik rólatok, te vagy a jövő — és a macska a kormány."' },
  { setup: 'Mi a különbség a részeg és a részeg között?', delivery: 'Az egyik részeg van, a másik részegen van!' },
  { setup: 'Miért sírt a számítógép?', delivery: 'Mert megtudta, hogy van vírus benne — és nem volt biztosítása!' },
  { setup: 'Bemegy egy csiga a zöldségeshez.', delivery: 'A zöldséges: "Mit kérsz?" A csiga: "Salátát." A zöldséges: "Befele vagy kifelé?" A csiga: "Befele." A zöldséges: "Akkor menj vissza!"' },
  { setup: 'Miért nem tudnak a szkeletonok titkokat tartani?', delivery: 'Mert mindenen átlátni rajtuk!' },
  { setup: 'Egy férfi bemegy az orvoshoz és azt mondja: "Doktor úr, mindenki figyelmen kívül hagy engem!"', delivery: 'Az orvos: "Következő!"' },
  { setup: 'Mi a különbség a jó tanács és a rossz tanács között?', delivery: 'A jó tanácsot megfogadják, a rosszat megfogadják és betartják.' },
  { setup: 'Miért nem kártyáznak az oroszlánok?', delivery: 'Mert mindig pokerarc van náluk!' },
  { setup: 'Találkozik két barát. Az egyik mondja: "Látod azt a házat? Az enyém!"', delivery: '"Tényleg? Szép!" — "Igen, csak az a baj, hogy belülről kell nézni."' },
  { setup: 'Mi a tehén kedvenc zenéje?', delivery: 'A MOO-zika!' },
  { setup: 'Miért nem tud az idő visszafelé menni?', delivery: 'Mert az óramutató csak előre halad — bár a fogaskerék néha megpróbálja visszafordítani!' },
  { setup: 'Egy kisgyerek azt kérdezi: "Mama, miért van annyi ősz hajad?"', delivery: 'Az anya: "Mert te olyan csintalan vagy, drágám." A gyerek: "De akkor a nagymamádon miért van annyi?"' },
  { setup: 'Mi a különbség a posta és a felesége között?', delivery: 'A posta egyszer sem kézbesít, a felesége mindig!' },
  { setup: 'Miért nem tud az ördög focizni?', delivery: 'Mert mindig megszedeszik!' },
  { setup: 'Bemegy egy kisfiú az iskolába és azt mondja a tanárnőnek: "Késtem, mert csúszós volt az út."', delivery: 'A tanárnő: "Te is?" A kisfiú: "Igen, ötször visszamentam megcsúszni!"' },
  { setup: 'Mi a különbség a turisták és a gólyák között?', delivery: 'A gólyák nyáron mennek el!' },
  { setup: 'Miért nem isznak a halak alkoholt?', delivery: 'Mert nem akarnak ázni!' },
  { setup: 'Találkozik két rovar. Az egyik mondja:', delivery: '"Hogy vagy?" — "Bolha vagyok." — "Az nem betegség!" — "De ha a kutya elkapja az embert, az már az!"' },
  { setup: 'Mi lesz a vízből, ha befagy?', delivery: 'Korcsolyapálya lesz belőle — de csak télen!' },
  { setup: 'Miért nem lehet az asztronautáknak éhesnek lenniük?', delivery: 'Mert mindig teli holdra néznek!' },
  { setup: 'Egy rendőr megállít egy autóst és azt mondja: "Tudja, hogy 140-el ment?"', delivery: 'Az autós: "Lehetetlen, 10 perce indultam el!"' },
  { setup: 'Miért van az iskolában mindig csend?', delivery: 'Mert a hangos diákokat kiküldik!' },
  { setup: 'Mi a különbség a kutya és a macska között?', delivery: 'A kutya azt gondolja: "Etetnek, gondoznak, szeretnek — biztos isten!" A macska azt gondolja: "Etetnek, gondoznak, szeretnek — biztos én vagyok az isten!"' },
  { setup: 'Miért nem mesél az újság vicceket?', delivery: 'Mert csak egyszer nevetnek rajta!' },
];

export async function getJoke(): Promise<JokeResponse> {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return jokes[dayOfYear % jokes.length];
}
