
console.log('index.tsx: Entry point loaded');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';

console.log('index.tsx: Imports completed');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('index.tsx: Root element not found');
  throw new Error("Could not find root element to mount to");
}

console.log('index.tsx: Mounting React app...');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('index.tsx: Root render called');
