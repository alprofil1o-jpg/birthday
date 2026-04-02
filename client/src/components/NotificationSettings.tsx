import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface NotificationSettings {
  enabled: boolean;
  oneWeekBefore: boolean;
  threeDaysBefore: boolean;
  oneDayBefore: boolean;
  onBirthdayDay: boolean;
}

interface NotificationSettingsProps {
  birthday: string;
}

export default function NotificationSettings({ birthday }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    oneWeekBefore: false,
    threeDaysBefore: false,
    oneDayBefore: false,
    onBirthdayDay: false,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    // Set up notification checks
    if (settings.enabled && Notification.permission === 'granted') {
      checkAndSendNotifications();
      const interval = setInterval(checkAndSendNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [settings.enabled]);

  const checkAndSendNotifications = () => {
    const today = new Date();
    const birthdayDate = new Date(birthday);
    let nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());

    if (nextBirthday < today) {
      nextBirthday = new Date(today.getFullYear() + 1, birthdayDate.getMonth(), birthdayDate.getDate());
    }

    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isToday = today.getMonth() === birthdayDate.getMonth() && today.getDate() === birthdayDate.getDate();

    const lastNotificationKey = `lastNotification_${birthday}`;
    const lastNotified = localStorage.getItem(lastNotificationKey);
    const today_string = today.toISOString().split('T')[0];

    if (lastNotified === today_string) {
      return; // Already notified today
    }

    if (isToday && settings.onBirthdayDay) {
      new Notification('🎉 Happy Birthday!', {
        body: 'Your birthday is today!',
        icon: '/android-chrome-192x192.png',
      });
      localStorage.setItem(lastNotificationKey, today_string);
    } else if (daysUntil === 1 && settings.oneDayBefore) {
      new Notification('🎂 Birthday Tomorrow!', {
        body: 'Your birthday is tomorrow!',
        icon: '/android-chrome-192x192.png',
      });
      localStorage.setItem(lastNotificationKey, today_string);
    } else if (daysUntil === 3 && settings.threeDaysBefore) {
      new Notification('📅 Birthday in 3 Days', {
        body: 'Your birthday is coming up in 3 days!',
        icon: '/android-chrome-192x192.png',
      });
      localStorage.setItem(lastNotificationKey, today_string);
    } else if (daysUntil === 7 && settings.oneWeekBefore) {
      new Notification('⏰ Birthday in 1 Week', {
        body: 'Your birthday is coming up in 1 week!',
        icon: '/android-chrome-192x192.png',
      });
      localStorage.setItem(lastNotificationKey, today_string);
    }
  };

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handleToggleEnabled = () => {
    if (!settings.enabled && notificationPermission !== 'granted') {
      handleRequestPermission();
    }
    handleToggleSetting('enabled');
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="text-sm"
      >
        🔔 Értesítések
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 p-6 bg-white dark:bg-gray-800 shadow-2xl z-50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Születésnapi Emlékeztetők
          </h3>

          <div className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Értesítések Engedélyezése</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notificationPermission === 'granted'
                    ? 'Értesítések engedélyezve'
                    : notificationPermission === 'denied'
                      ? 'Értesítések letiltva'
                      : 'Kattints az engedélyezéshez'}
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleToggleEnabled}
                disabled={notificationPermission === 'denied'}
              />
            </div>

            {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
              <Button onClick={handleRequestPermission} className="w-full">
                Értesítések Engedélyezése
              </Button>
            )}

            {settings.enabled && notificationPermission === 'granted' && (
              <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">✓ Aktív</p>
              </Card>
            )}

            {settings.enabled && (
              <div className="space-y-4 border-t pt-4">
                <Label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Emlékeztetj rá:
                </Label>

                {/* 1 Week Before */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded">
                  <Label className="text-sm cursor-pointer">1 héttel előbb</Label>
                  <Switch
                    checked={settings.oneWeekBefore}
                    onCheckedChange={() => handleToggleSetting('oneWeekBefore')}
                  />
                </div>

                {/* 3 Days Before */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded">
                  <Label className="text-sm cursor-pointer">3 nappal előbb</Label>
                  <Switch
                    checked={settings.threeDaysBefore}
                    onCheckedChange={() => handleToggleSetting('threeDaysBefore')}
                  />
                </div>

                {/* 1 Day Before */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded">
                  <Label className="text-sm cursor-pointer">1 nappal előbb</Label>
                  <Switch
                    checked={settings.oneDayBefore}
                    onCheckedChange={() => handleToggleSetting('oneDayBefore')}
                  />
                </div>

                {/* On Birthday Day */}
                <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded">
                  <Label className="text-sm cursor-pointer font-semibold">Születésnapomat 🎉</Label>
                  <Switch
                    checked={settings.onBirthdayDay}
                    onCheckedChange={() => handleToggleSetting('onBirthdayDay')}
                  />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Napi egy értesítés. Engedélyezd az eszköz értesítéseit.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
