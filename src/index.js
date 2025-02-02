import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MusicProvider } from './components/Music/MusicProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MusicProvider>
  <App />
  </MusicProvider>
);

reportWebVitals();
