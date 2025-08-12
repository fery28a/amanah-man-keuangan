// src/components/Shared/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/kas-masuk', label: 'Kas Masuk' },
    { path: '/kas-keluar', label: 'Kas Keluar' },
    { path: '/hutang', label: 'Hutang' },
    { path: '/piutang', label: 'Piutang' },
    { path: '/item-keluar', label: 'Item Keluar' },
    { path: '/laporan', label: 'Laporan' },
  ];

  return (
    <nav className="bg-white p-4 shadow-md flex justify-between items-center flex-wrap">
      <div className="text-2xl font-bold text-gray-800 mr-6 mb-2 md:mb-0">
        Amanah Keuangan
      </div>
      <div className="flex-1 flex flex-wrap justify-center md:justify-start">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`mr-4 p-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
              location.pathname === link.path
                ? 'bg-gray-800 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center mt-2 md:mt-0">
        <span className="mr-4 text-gray-600 text-sm">Halo, Fery!</span>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </nav>
  );
};

export default Navbar;