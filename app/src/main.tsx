import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './tailwind.css';
import './theme/theme.css';
import { UiStateProvider } from './components/ui/UiStateContext';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <UiStateProvider>
      <App />
    </UiStateProvider>
  </React.StrictMode>
);