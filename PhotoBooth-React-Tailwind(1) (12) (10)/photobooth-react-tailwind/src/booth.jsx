import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BoothPage from './pages/BoothPage';
import App from './App';
import './styles.css';

const root = document.getElementById('root');

createRoot(root).render(
  <StrictMode>
    <App page="booth"><BoothPage /></App>
  </StrictMode>,
);
