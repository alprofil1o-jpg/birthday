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
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        birthday TEXT NOT NULL,
        text TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_ts TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS countdown_events (
        id TEXT PRIMARY KEY,
        birthday TEXT NOT NULL,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        emoji TEXT NOT NULL DEFAULT '🎯',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS saved_timers (
        id TEXT PRIMARY KEY,
        birthday TEXT NOT NULL,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL DEFAULT '⏱️',
        total_seconds INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        birthday TEXT PRIMARY KEY,
        lock_rotation BOOLEAN DEFAULT false,
        disable_easter_eggs BOOLEAN DEFAULT false,
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

// ── Notes ────────────────────────────────────────────────────────────────────

app.get('/api/notes/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    if (pool) {
      const { rows } = await pool.query(
        'SELECT id, text, color, created_at FROM notes WHERE birthday = $1 ORDER BY created_ts DESC',
        [birthday]
      );
      return res.json(rows.map((r: any) => ({ id: r.id, text: r.text, color: r.color, createdAt: r.created_at })));
    }
    const all = loadFile(SETTINGS_FILE) || {};
    return res.json((all[birthday + '_notes']) || []);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/notes/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    const { id, text, color, createdAt } = req.body;
    if (pool) {
      await pool.query(
        `INSERT INTO notes (id, birthday, text, color, created_at) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET text=$3, color=$4, created_at=$5`,
        [id, birthday, text, color, createdAt]
      );
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      const key = birthday + '_notes';
      const notes = all[key] || [];
      const idx = notes.findIndex((n: any) => n.id === id);
      if (idx >= 0) notes[idx] = { id, text, color, createdAt };
      else notes.unshift({ id, text, color, createdAt });
      all[key] = notes;
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/notes/:birthday/:id', async (req, res) => {
  try {
    const { birthday, id } = req.params;
    if (pool) {
      await pool.query('DELETE FROM notes WHERE id=$1 AND birthday=$2', [id, birthday]);
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      const key = birthday + '_notes';
      all[key] = (all[key] || []).filter((n: any) => n.id !== id);
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── Countdown Events ──────────────────────────────────────────────────────────

app.get('/api/events/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    if (pool) {
      const { rows } = await pool.query(
        'SELECT id, name, date, emoji FROM countdown_events WHERE birthday=$1 ORDER BY date ASC',
        [birthday]
      );
      return res.json(rows);
    }
    const all = loadFile(SETTINGS_FILE) || {};
    return res.json(all[birthday + '_events'] || []);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/events/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    const { id, name, date, emoji } = req.body;
    if (pool) {
      await pool.query(
        `INSERT INTO countdown_events (id, birthday, name, date, emoji) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET name=$3, date=$4, emoji=$5`,
        [id, birthday, name, date, emoji]
      );
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      const key = birthday + '_events';
      const events = all[key] || [];
      const idx = events.findIndex((e: any) => e.id === id);
      if (idx >= 0) events[idx] = { id, name, date, emoji };
      else events.push({ id, name, date, emoji });
      all[key] = events;
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/events/:birthday/:id', async (req, res) => {
  try {
    const { birthday, id } = req.params;
    if (pool) {
      await pool.query('DELETE FROM countdown_events WHERE id=$1 AND birthday=$2', [id, birthday]);
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      const key = birthday + '_events';
      all[key] = (all[key] || []).filter((e: any) => e.id !== id);
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── Saved Timers ──────────────────────────────────────────────────────────────

app.get('/api/timers/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    if (pool) {
      const { rows } = await pool.query(
        'SELECT id, name, emoji, total_seconds as "totalSeconds" FROM saved_timers WHERE birthday=$1 ORDER BY created_at ASC',
        [birthday]
      );
      return res.json(rows);
    }
    const all = loadFile(SETTINGS_FILE) || {};
    return res.json(all[birthday + '_timers'] || []);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/timers/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    const { id, name, emoji, totalSeconds } = req.body;
    if (pool) {
      await pool.query(
        `INSERT INTO saved_timers (id, birthday, name, emoji, total_seconds) VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET name=$3, emoji=$4, total_seconds=$5`,
        [id, birthday, name, emoji, totalSeconds]
      );
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      const key = birthday + '_timers';
      const timers = all[key] || [];
      const idx = timers.findIndex((t: any) => t.id === id);
      if (idx >= 0) timers[idx] = { id, name, emoji, totalSeconds };
      else timers.push({ id, name, emoji, totalSeconds });
      all[key] = timers;
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.delete('/api/timers/:birthday/:id', async (req, res) => {
  try {
    const { birthday, id } = req.params;
    if (pool) {
      await pool.query('DELETE FROM saved_timers WHERE id=$1 AND birthday=$2', [id, birthday]);
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      const key = birthday + '_timers';
      all[key] = (all[key] || []).filter((t: any) => t.id !== id);
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── App Settings ──────────────────────────────────────────────────────────────

app.get('/api/app-settings/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    if (pool) {
      const { rows } = await pool.query('SELECT lock_rotation, disable_easter_eggs FROM app_settings WHERE birthday=$1', [birthday]);
      if (rows.length === 0) return res.json({ lockRotation: false, disableEasterEggs: false });
      return res.json({ lockRotation: rows[0].lock_rotation, disableEasterEggs: rows[0].disable_easter_eggs });
    }
    const all = loadFile(SETTINGS_FILE) || {};
    return res.json(all[birthday + '_appsettings'] || { lockRotation: false, disableEasterEggs: false });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/app-settings/:birthday', async (req, res) => {
  try {
    const { birthday } = req.params;
    const { lockRotation, disableEasterEggs } = req.body;
    if (pool) {
      await pool.query(
        `INSERT INTO app_settings (birthday, lock_rotation, disable_easter_eggs, updated_at) VALUES ($1,$2,$3,NOW())
         ON CONFLICT (birthday) DO UPDATE SET lock_rotation=$2, disable_easter_eggs=$3, updated_at=NOW()`,
        [birthday, lockRotation, disableEasterEggs]
      );
    } else {
      const all = loadFile(SETTINGS_FILE) || {};
      all[birthday + '_appsettings'] = { lockRotation, disableEasterEggs };
      saveFile(SETTINGS_FILE, all);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
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