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

// Try to use PostgreSQL, fall back to file storage
let pool: any = null;
const DB_URL = process.env.DATABASE_URL || '';
console.log('DATABASE_URL present:', !!DB_URL);

if (DB_URL) {
  try {
    const pkg = await import('pg');
    const { Pool } = pkg.default;
    pool = new Pool({
      connectionString: DB_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    // Test connection
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected!');
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
    console.log('Database tables ready');
  } catch (e) {
    console.error('PostgreSQL failed, using file storage:', e.message);
    pool = null;
  }
} else {
  console.log('No DATABASE_URL, using file storage');
}

// File-based fallback
const SUBS_FILE = path.join(process.cwd(), 'subscriptions.json');
const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

function loadFile(file: string): any {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}
function saveFile(file: string, data: any) {
  try { fs.writeFileSync(file, JSON.stringify(data), 'utf-8'); } catch {}
}

// Push subscription endpoints
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    if (pool) {
      await pool.query(
        `INSERT INTO push_subscriptions (endpoint, subscription) VALUES ($1, $2)
         ON CONFLICT (endpoint) DO UPDATE SET subscription = $2`,
        [subscription.endpoint, JSON.stringify(subscription)]
      );
    } else {
      const subs = loadFile(SUBS_FILE) || [];
      if (!subs.find((s: any) => s.endpoint === subscription.endpoint)) {
        subs.push(subscription);
        saveFile(SUBS_FILE, subs);
      }
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.delete('/api/push/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (pool) {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    } else {
      const subs = (loadFile(SUBS_FILE) || []).filter((s: any) => s.endpoint !== endpoint);
      saveFile(SUBS_FILE, subs);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

async function sendPushToAll(title: string, body: string, tag: string) {
  let subs: any[] = [];
  if (pool) {
    const { rows } = await pool.query('SELECT endpoint, subscription FROM push_subscriptions');
    subs = rows.map((r: any) => r.subscription);
  } else {
    subs = loadFile(SUBS_FILE) || [];
  }
  const results = await Promise.allSettled(
    subs.map((sub: any) => webpush.sendNotification(sub, JSON.stringify({ title, body, tag })))
  );
  // Remove expired
  const valid = subs.filter((_: any, i: number) => results[i].status === 'fulfilled');
  if (pool) {
    for (let i = 0; i < subs.length; i++) {
      if (results[i].status === 'rejected') {
        await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [subs[i].endpoint]);
      }
    }
  } else {
    saveFile(SUBS_FILE, valid);
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
    res.json({ sent, db: !!pool });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/balint-kalandjai', async (req, res) => {
  await sendPushToAll('🐣 EASTER EGG', 'Iratkozz fel a Bálint Kalandjai youtube csatornára!', 'easter-egg');
  res.json({ ok: true });
});

// Settings sync
app.get('/api/settings/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM user_settings WHERE birthday = $1', [birthday]);
      if (rows.length === 0) return res.json({ savedNames: [], reminders: [], notificationSettings: {} });
      return res.json({ savedNames: rows[0].saved_names, reminders: rows[0].reminders, notificationSettings: rows[0].notification_settings });
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      return res.json(all[birthday] || { savedNames: [], reminders: [], notificationSettings: {} });
    }
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/settings/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    const { savedNames, reminders, notificationSettings } = req.body;
    if (pool) {
      await pool.query(
        `INSERT INTO user_settings (birthday, saved_names, reminders, notification_settings, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (birthday) DO UPDATE SET saved_names=$2, reminders=$3, notification_settings=$4, updated_at=NOW()`,
        [birthday, JSON.stringify(savedNames), JSON.stringify(reminders), JSON.stringify(notificationSettings)]
      );
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      all[birthday] = { savedNames, reminders, notificationSettings };
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/weather', async (req: express.Request, res: express.Response) => {
  try { res.json(await getWeather()); } catch { res.status(500).json({ error: 'Failed' }); }
});
app.get('/api/joke', async (req: express.Request, res: express.Response) => {
  try { res.json(await getJoke()); } catch { res.status(500).json({ error: 'Failed' }); }
});
app.get('/api/nameday', async (req: express.Request, res: express.Response) => {
  try { res.json(await getNameDay()); } catch { res.status(500).json({ error: 'Failed' }); }
});

export async function startServer(port: any) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer(process.env.PORT || 3001);
}