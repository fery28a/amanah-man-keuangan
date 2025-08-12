// src/pages/Dashboard.jsx
import React, { useContext } from 'react';
import DataKeuanganContext from '../context/DataKeuanganContext';

const Dashboard = () => {
  const { hutangData, setHutangData } = useContext(DataKeuanganContext);

  // Logika untuk mencari hutang yang mendekati jatuh tempo (dalam 7 hari)
  const today = new Date();
  const upcomingHutang = hutangData.filter(item => {
    const dueDate = new Date(item.tanggalJatuhTempo);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && item.statusPembayaran !== 'Lunas';
  });

  const handleBayarHutang = (id) => {
    const nominalToPay = hutangData.find(item => item.id === id).sisaHutang;
    alert(`Membayar hutang sebesar Rp${nominalToPay.toLocaleString('id-ID')}`);
    // Di sini Anda bisa menambahkan logika pembayaran ke database atau API
    setHutangData(
      hutangData.map(item =>
        item.id === id ? { ...item, sisaHutang: 0, statusPembayaran: 'Lunas' } : item
      )
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <p className="text-gray-600">Selamat datang di dashboard manajemen keuangan.</p>

      {/* Kontainer Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Kontainer untuk Hutang Jatuh Tempo */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-full md:col-span-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span role="img" aria-label="alarm" className="mr-2">⏰</span> Hutang Mendekati Jatuh Tempo
          </h2>
          {upcomingHutang.length === 0 ? (
            <p className="text-gray-500">Tidak ada hutang yang mendekati jatuh tempo.</p>
          ) : (
            <ul>
              {upcomingHutang.map(item => (
                <li key={item.id} className="border-b last:border-b-0 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-md font-semibold">{item.namaSuplier}</p>
                    <p className="text-sm text-gray-500">Jatuh Tempo: {new Date(item.tanggalJatuhTempo).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-red-500">Rp{item.sisaHutang.toLocaleString('id-ID')}</p>
                  </div>
                  <button
                    onClick={() => handleBayarHutang(item.id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-200"
                  >
                    Bayar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contoh Card lainnya */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total Kas</h2>
          <p className="text-3xl font-bold text-green-500 mt-2">Rp 5.000.000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Kas Masuk Bulan Ini</h2>
          <p className="text-3xl font-bold text-blue-500 mt-2">Rp 2.500.000</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;