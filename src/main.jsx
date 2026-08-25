import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

const NOISY_ERRORS = [
  /this model does not support image input/i,
  /Cannot read .*image\.png/i,
  /ResizeObserver loop/i,
  /Error handling response/i,
];

const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.join(' ');
  if (NOISY_ERRORS.some(pattern => pattern.test(msg))) return;
  originalConsoleError.apply(console, args);
};

window.addEventListener('error', (e) => {
  const msg = e.message || '';
  if (NOISY_ERRORS.some(pattern => pattern.test(msg))) {
    e.preventDefault();
    e.stopPropagation();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason?.message || e.reason || '';
  if (NOISY_ERRORS.some(pattern => pattern.test(reason))) {
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

