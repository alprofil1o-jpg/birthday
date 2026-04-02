import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { getWeather } from './routes/weather.js';
import { getJoke } from './routes/joke.js';
import { getNameDay } from './routes/nameday.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
