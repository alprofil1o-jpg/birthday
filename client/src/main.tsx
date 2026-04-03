import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function updateDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  updateDarkClass(savedTheme === 'dark');
} else {
  updateDarkClass(darkQuery.matches);
}

darkQuery.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    updateDarkClass(e.matches);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
