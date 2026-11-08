import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './liquid-glass.css';
import './controls.css';
import './glass-controls.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
