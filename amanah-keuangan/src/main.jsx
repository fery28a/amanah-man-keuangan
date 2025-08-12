// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './routes.jsx';
import './index.css';
import { DataKeuanganProvider } from './context/DataKeuanganContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataKeuanganProvider>
      <RouterProvider router={router} />
    </DataKeuanganProvider>
  </React.StrictMode>
);