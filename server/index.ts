import express from 'express';
import dotenv from 'dotenv';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { setupStaticServing } from './static-serve.js';
import { getWeather } from './routes/weather.js';
import { getJoke } from './routes/joke.js';
import { getNameDay } from './routes/nameday.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails('mailto:admin@birthday-buddy.app', VAPID_PUBLIC, VAPID_PRIVATE);
}

// File-based subscription store — survives server restarts
const SUBS_FILE = path.join(process.cwd(), 'subscriptions.json');

function loadSubscriptions(): any[] {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
    }
  } catch (e) {}
  return [];
}

function saveSubscriptions(subs: any[]) {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subs), 'utf-8');
  } catch (e) {}
}

let subscriptions: any[] = loadSubscriptions();
console.log(`Loaded ${subscriptions.length} subscriptions from file`);

app.post('/api/push/subscribe', (req, res) => {
  const subscription = req.body;
  const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    saveSubscriptions(subscriptions);
  }
  res.json({ ok: true, total: subscriptions.length });
});

app.delete('/api/push/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  saveSubscriptions(subscriptions);
  res.json({ ok: true });
});

app.post('/api/push/send', async (req, res) => {
  const { title, body, tag } = req.body;
  const payload = JSON.stringify({ title, body, tag });
  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );
  subscriptions = subscriptions.filter((_, i) => results[i].status === 'fulfilled');
  saveSubscriptions(subscriptions);
  res.json({ sent: results.filter(r => r.status === 'fulfilled').length });
});

app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ key: VAPID_PUBLIC });
});

app.get('/api/push/test', async (req, res) => {
  const payload = JSON.stringify({ title: '🧪 Teszt', body: 'Működik!', tag: 'test' });
  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );
  subscriptions = subscriptions.filter((_, i) => results[i].status === 'fulfilled');
  saveSubscriptions(subscriptions);
  res.json({ subscriptions: subscriptions.length, results: results.map(r => r.status) });
});

app.get('/balint-kalandjai', async (req, res) => {
  const payload = JSON.stringify({ title: '🐣 EASTER EGG', body: 'Iratkozz fel a Bálint Kalandjai youtube csatornára!', tag: 'easter-egg' });
  await Promise.allSettled(subscriptions.map(sub => webpush.sendNotification(sub, payload)));
  res.json({ ok: true });
});

app.get('/api/weather', async (req: express.Request, res: express.Response) => {
  try { res.json(await getWeather()); } catch { res.status(500).json({ error: 'Failed to fetch weather' }); }
});

app.get('/api/joke', async (req: express.Request, res: express.Response) => {
  try { res.json(await getJoke()); } catch { res.status(500).json({ error: 'Failed to fetch joke' }); }
});

app.get('/api/nameday', async (req: express.Request, res: express.Response) => {
  try { res.json(await getNameDay()); } catch { res.status(500).json({ error: 'Failed to fetch name day' }); }
});

export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer(process.env.PORT || 3001);
}