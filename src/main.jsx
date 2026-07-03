import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FavoritesProvider } from './context/FavoritesContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </StrictMode>
);
