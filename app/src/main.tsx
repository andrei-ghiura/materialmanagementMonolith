import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './tailwind.css';
import './theme/theme.css';
import { UiStateProvider } from './components/ui/UiStateContext';
import { ToastProvider } from './components/ui/ToastProvider';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <UiStateProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </UiStateProvider>
  </React.StrictMode>
);