import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import './i18n'; // Initialize i18n
import { TooltipProvider } from './components/ui/tooltip';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </React.StrictMode>
);