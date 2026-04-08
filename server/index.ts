import express from 'express';
import dotenv from 'dotenv';
import webpush from 'web-push';
import pkg from 'pg';
const { Pool } = pkg;
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

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

// Initialize database tables
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      subscription JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id SERIAL PRIMARY KEY,
      birthday TEXT NOT NULL UNIQUE,
      saved_names JSONB DEFAULT '[]',
      reminders JSONB DEFAULT '[]',
      notification_settings JSONB DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Database initialized');
}

// Push subscription endpoints
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    await pool.query(
      `INSERT INTO push_subscriptions (endpoint, subscription)
       VALUES ($1, $2)
       ON CONFLICT (endpoint) DO UPDATE SET subscription = $2`,
      [subscription.endpoint, JSON.stringify(subscription)]
    );
    const { rows } = await pool.query('SELECT COUNT(*) FROM push_subscriptions');
    res.json({ ok: true, total: parseInt(rows[0].count) });
  } catch (e) {
    console.error('Subscribe error:', e);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.delete('/api/push/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

async function sendPushToAll(title: string, body: string, tag: string) {
  const { rows } = await pool.query('SELECT subscription FROM push_subscriptions');
  const results = await Promise.allSettled(
    rows.map(row => webpush.sendNotification(row.subscription, JSON.stringify({ title, body, tag })))
  );
  // Remove expired subscriptions
  for (let i = 0; i < rows.length; i++) {
    if (results[i].status === 'rejected') {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [rows[i].subscription.endpoint]);
    }
  }
  return results.filter(r => r.status === 'fulfilled').length;
}

app.post('/api/push/send', async (req, res) => {
  try {
    const { title, body, tag } = req.body;
    const sent = await sendPushToAll(title, body, tag);
    res.json({ sent });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send' });
  }
});

app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ key: VAPID_PUBLIC });
});

app.get('/api/push/test', async (req, res) => {
  try {
    const sent = await sendPushToAll('🧪 Teszt', 'Működik!', 'test');
    const { rows } = await pool.query('SELECT COUNT(*) FROM push_subscriptions');
    res.json({ subscriptions: parseInt(rows[0].count), sent });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/balint-kalandjai', async (req, res) => {
  await sendPushToAll('🐣 EASTER EGG', 'Iratkozz fel a Bálint Kalandjai youtube csatornára!', 'easter-egg');
  res.json({ ok: true });
});

// User settings sync — identified by birthday date
app.get('/api/settings/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM user_settings WHERE birthday = $1', [birthday]
    );
    if (rows.length === 0) {
      return res.json({ savedNames: [], reminders: [], notificationSettings: {} });
    }
    const row = rows[0];
    res.json({
      savedNames: row.saved_names,
      reminders: row.reminders,
      notificationSettings: row.notification_settings,
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.post('/api/settings/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    const { savedNames, reminders, notificationSettings } = req.body;
    await pool.query(
      `INSERT INTO user_settings (birthday, saved_names, reminders, notification_settings, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (birthday) DO UPDATE SET
         saved_names = $2,
         reminders = $3,
         notification_settings = $4,
         updated_at = NOW()`,
      [birthday, JSON.stringify(savedNames), JSON.stringify(reminders), JSON.stringify(notificationSettings)]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
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
    await initDB();
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