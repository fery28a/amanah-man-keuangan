// src/components/Shared/Layout.jsx
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Navbar />
      <main className="p-6 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;