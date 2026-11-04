import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './pages/HomePage';
import App from './App';
import './styles.css';

const root = document.getElementById('root');

createRoot(root).render(
  <StrictMode>
    <App><HomePage /></App>
  </StrictMode>,
);
