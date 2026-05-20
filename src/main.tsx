import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppDemo from './app/AppDemo';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <AppDemo />
    </ErrorBoundary>
  </StrictMode>
);
