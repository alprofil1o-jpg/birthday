# Birthday Buddy 🎂

Magyar születésnapi számláló app budapesti időjárással, névnapokkal és napi viccekkel.

## Helyi futtatás

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Deploy Railway-re (ajánlott, ingyenes)

1. Regisztrálj: https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Töltsd fel a kódot GitHub-ra, vagy használd a Railway CLI-t
4. Railway automatikusan felismeri a Node.js projektet
5. A `start` script fut production-ban: `npm run build && npm start`

**Fontos:** A `package.json`-ban lévő `start` script először buildelni kell:
```json
"start": "npm run build && node dist/server/index.js"
```

## Deploy Render.com-ra (alternatíva, ingyenes)

1. Regisztrálj: https://render.com
2. "New Web Service" → GitHub repo kapcsolás
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/server/index.js`

## Fájlstruktúra

```
birthday-buddy/
├── client/              # React frontend (Vite)
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── pages/
│       │   └── BirthdayTracker.tsx
│       ├── components/
│       │   ├── Dashboard.tsx
│       │   ├── BirthdaySetup.tsx
│       │   ├── NotificationSettings.tsx
│       │   ├── widgets/
│       │   │   ├── Clock.tsx
│       │   │   ├── BirthdayCountdown.tsx
│       │   │   ├── Weather.tsx
│       │   │   ├── DailyJoke.tsx
│       │   │   └── NameDay.tsx
│       │   └── ui/          # shadcn/ui komponensek
│       └── lib/
│           └── utils.ts
├── server/              # Express backend
│   ├── index.ts
│   ├── static-serve.ts
│   └── routes/
│       ├── weather.ts
│       ├── joke.ts
│       └── nameday.ts
├── package.json
├── vite.config.js
├── tailwind.config.js
├── tsconfig.json
└── tsconfig.server.json
```
