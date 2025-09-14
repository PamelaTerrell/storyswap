import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import './index.css';
import App from './App.jsx';

inject(); // no-op in dev; enables Vercel Web Analytics in production

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
