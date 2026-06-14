import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { ThemeProvider } from './app/ThemeProvider';
import { SettingsProvider } from './app/SettingsProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </SettingsProvider>
  </React.StrictMode>
);
