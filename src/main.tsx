// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Tailwind

if (import.meta.env.DEV) {
  const { StrictMode } = React;
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  createRoot(document.getElementById('root')!).render(<App />);
}