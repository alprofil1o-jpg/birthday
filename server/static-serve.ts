import path from 'path';
import express from 'express';

export function setupStaticServing(app: express.Application) {
  app.use(express.static(path.join(process.cwd(), 'dist/public')));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(process.cwd(), 'dist/public', 'index.html'));
  });
}
