export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.error('SW registration failed:', e);
    return null;
  }
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const reg = await registerServiceWorker();
    if (!reg) return null;

    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    const res = await fetch('/api/push/vapid-public-key');
    const { key } = await res.json();
    if (!key) return null;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (e) {
    console.error('Push subscribe failed:', e);
    return null;
  }
}

export async function unsubscribeFromPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
  } catch (e) {
    console.error('Unsubscribe failed:', e);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Schedule checker — run on app load
export function startNotificationScheduler(savedNames: string[], nameDays: Record<string, string>) {
  const check = () => {
    const settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    if (!settings.enabled) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Nameday notifications
    if (settings.nameDayAlerts && savedNames.length > 0) {
      for (const name of savedNames) {
        for (const [key, val] of Object.entries(nameDays)) {
          if (val.toLowerCase().includes(name.toLowerCase())) {
            const [m, d] = key.split('-').map(Number);
            let next = new Date(today.getFullYear(), m - 1, d);
            if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
            const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const notifKey = `nameday_notif_${name}_${todayStr}`;
            if (!localStorage.getItem(notifKey)) {
              const alertDays = settings.nameDayAlertDays || [0, 1, 3, 7];
              if (alertDays.includes(diff)) {
                const msg = diff === 0 ? `Ma van ${name} névnapja! 🎉` : `${name} névnapja ${diff} nap múlva! 👤`;
                fetch('/api/push/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: 'Birthday Buddy 👤', body: msg, tag: `nameday-${name}` }),
                });
                localStorage.setItem(notifKey, '1');
              }
            }
          }
        }
      }
    }

    // Custom reminders
    const reminders: any[] = JSON.parse(localStorage.getItem('customReminders') || '[]');
    for (const reminder of reminders) {
      if (!reminder.active) continue;
      const notifKey = `reminder_${reminder.id}_${todayStr}_${today.getHours()}`;
      if (localStorage.getItem(notifKey)) continue;

      const nowHour = today.getHours();
      const reminderHour = parseInt(reminder.hour || '8');
      if (nowHour !== reminderHour) continue;

      if (reminder.type === 'once') {
        const targetDate = reminder.date;
        if (targetDate === todayStr) {
          fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `⏰ ${reminder.name}`, body: 'Emlékeztető!', tag: `reminder-${reminder.id}` }),
          });
          localStorage.setItem(notifKey, '1');
        }
      } else if (reminder.type === 'recurring') {
        const dayOfWeek = today.getDay();
        const days: number[] = reminder.days || [];
        if (days.includes(dayOfWeek)) {
          const startDate = new Date(reminder.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + (reminder.weeks || 1) * 7);
          if (today >= startDate && today <= endDate) {
            fetch('/api/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: `⏰ ${reminder.name}`, body: 'Ismétlődő emlékeztető!', tag: `reminder-${reminder.id}` }),
            });
            localStorage.setItem(notifKey, '1');
          }
        }
      }
    }
  };

  check();
  return setInterval(check, 60000);
}
