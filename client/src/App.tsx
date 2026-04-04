import * as React from 'react';
import { useEffect } from 'react';
import BirthdayTracker from './pages/BirthdayTracker';
import { autoReRegisterPush } from './lib/pushHelper';
import './index.css';

function App() {
  useEffect(() => {
    // Every page load: silently re-register push subscription
    // This fixes the issue where server restarts lose all subscriptions
    autoReRegisterPush();
  }, []);

  return <BirthdayTracker />;
}

export default App;
