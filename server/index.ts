import express from 'express';
import dotenv from 'dotenv';
import webpush from 'web-push';
import { setupStaticServing } from './static-serve.js';
import { getWeather } from './routes/weather.js';
import { getJoke } from './routes/joke.js';
import { getNameDay } from './routes/nameday.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// VAPID keys - generate once and store in env vars
// Run: npx web-push generate-vapid-keys
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    'mailto:admin@birthday-buddy.app',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

// In-memory subscription store (use DB in production)
let subscriptions: any[] = [];

// Push subscription endpoint
app.post('/api/push/subscribe', (req, res) => {
  const subscription = req.body;
  const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
  }
  res.json({ ok: true });
});

app.delete('/api/push/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  res.json({ ok: true });
});

// Send push to all subscribers
app.post('/api/push/send', async (req, res) => {
  const { title, body, tag } = req.body;
  const payload = JSON.stringify({ title, body, tag });
  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );
  // Remove expired subscriptions
  subscriptions = subscriptions.filter((_, i) =>
    results[i].status === 'fulfilled'
  );
  res.json({ sent: results.filter(r => r.status === 'fulfilled').length });
});

// Get VAPID public key
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ key: VAPID_PUBLIC });
});

// Existing API routes
app.get('/api/weather', async (req: express.Request, res: express.Response) => {
  try {
    const data = await getWeather();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.get('/api/joke', async (req: express.Request, res: express.Response) => {
  try {
    const data = await getJoke();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch joke' });
  }
});

app.get('/api/nameday', async (req: express.Request, res: express.Response) => {
  try {
    const data = await getNameDay();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch name day' });
  }
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

app.get('/balint-kalandjai', async (req, res) => {
  const payload = JSON.stringify({ title: '🐇EASTER EGG', body: 'Iratkozz fel a Bálint Kalandjai youtube csatornára!', tag: 'test' });
  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );
  res.json({ subscriptions: subscriptions.length, results: results.map(r => r.status) });
});