let timerInterval = null;
let timerEnd = null;
let timerName = '';

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  // Special: start persistent timer notification
  if (data.type === 'timer-start') {
    timerEnd = data.endTime;
    timerName = data.name || 'Időzítő';
    startTimerNotification();
    return;
  }

  if (data.type === 'timer-stop') {
    stopTimerNotification();
    return;
  }

  const title = data.title || 'Birthday Buddy';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Megnyitás' },
      { action: 'close', title: 'Bezárás' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

function fmtSecs(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function startTimerNotification() {
  if (timerInterval) clearInterval(timerInterval);

  const update = () => {
    if (!timerEnd) return;
    const left = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));

    if (left <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      self.registration.showNotification('⏰ ' + timerName + ' lejárt!', {
        body: 'Az időzítő lejárt!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'timer-done',
        requireInteraction: true,
        vibrate: [400, 200, 400, 200, 400],
        actions: [{ action: 'open', title: 'Megnyitás' }]
      });
      return;
    }

    self.registration.showNotification('⏱️ ' + timerName, {
      body: fmtSecs(left) + ' van hátra',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'timer-running',
      renotify: false,
      silent: true,
      requireInteraction: false,
    });
  };

  update();
  timerInterval = setInterval(update, 1000);
}

function stopTimerNotification() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerEnd = null;
  self.registration.getNotifications({ tag: 'timer-running' }).then(ns => ns.forEach(n => n.close()));
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'timer-start') {
    timerEnd = event.data.endTime;
    timerName = event.data.name || 'Időzítő';
    startTimerNotification();
  }
  if (event.data?.type === 'timer-stop') {
    stopTimerNotification();
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
