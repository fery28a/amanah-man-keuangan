import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';

const API_URLS = {
  hutang: 'http://localhost:5019/api/hutang',
  piutang: 'http://localhost:5019/api/piutang',
};

const Dashboard = () => {
  const { hutangData, setHutangData, piutangData, setPiutangData } = useContext(DataKeuanganContext);
  
  // State untuk modal pembayaran Hutang
  const [isHutangModalOpen, setIsHutangModalOpen] = useState(false);
  const [selectedHutangId, setSelectedHutangId] = useState(null);
  const [hutangPaymentAmount, setHutangPaymentAmount] = useState('');
  
  // State untuk modal pembayaran Piutang
  const [isPiutangModalOpen, setIsPiutangModalOpen] = useState(false);
  const [selectedPiutangId, setSelectedPiutangId] = useState(null);
  const [piutangPaymentAmount, setPiutangPaymentAmount] = useState('');

  // Ambil data dari backend saat dashboard dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hutangRes, piutangRes] = await Promise.all([
          axios.get(API_URLS.hutang),
          axios.get(API_URLS.piutang),
        ]);
        setHutangData(hutangRes.data.data);
        setPiutangData(piutangRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, [setHutangData, setPiutangData]);

  // Logika untuk Hutang yang mendekati jatuh tempo (dalam 7 hari)
  const today = new Date();
  const upcomingHutang = hutangData.filter(item => {
    const dueDate = new Date(item.tanggalJatuhTempo);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && item.statusPembayaran !== 'Lunas';
  });

  // Logika untuk Piutang yang mendekati jatuh tempo (dalam 7 hari)
  const upcomingPiutang = piutangData.filter(item => {
    const dueDate = new Date(item.tanggalJatuhTempo);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7 && item.statusPembayaran !== 'Lunas';
  });

  const openHutangPaymentModal = (id) => {
    setSelectedHutangId(id);
    setIsHutangModalOpen(true);
  };

  const handleHutangPayment = async (e) => {
    e.preventDefault();
    const payment = parseFloat(hutangPaymentAmount);
    if (!payment || payment <= 0) return;
  
    const itemToUpdate = hutangData.find(item => item._id === selectedHutangId);
    const newSisaHutang = itemToUpdate.sisaHutang - payment;
    const newStatus = newSisaHutang <= 0 ? 'Lunas' : 'Belum Lunas';
  
    try {
      await axios.put(`${API_URLS.hutang}/${selectedHutangId}`, {
        sisaHutang: newSisaHutang > 0 ? newSisaHutang : 0,
        statusPembayaran: newStatus,
      });
      const res = await axios.get(API_URLS.hutang);
      setHutangData(res.data.data);
    } catch (err) {
      console.error('Error updating hutang:', err);
    }
  
    setHutangPaymentAmount('');
    setIsHutangModalOpen(false);
  };
  
  const openPiutangPaymentModal = (id) => {
    setSelectedPiutangId(id);
    setIsPiutangModalOpen(true);
  };

  const handlePiutangPayment = async (e) => {
    e.preventDefault();
    const payment = parseFloat(piutangPaymentAmount);
    if (!payment || payment <= 0) return;
  
    const itemToUpdate = piutangData.find(item => item._id === selectedPiutangId);
    const newSisaPiutang = itemToUpdate.sisaPiutang - payment;
    const newStatus = newSisaPiutang <= 0 ? 'Lunas' : 'Belum Lunas';
  
    try {
      await axios.put(`${API_URLS.piutang}/${selectedPiutangId}`, {
        sisaPiutang: newSisaPiutang > 0 ? newSisaPiutang : 0,
        statusPembayaran: newStatus,
      });
      const res = await axios.get(API_URLS.piutang);
      setPiutangData(res.data.data);
    } catch (err) {
      console.error('Error updating piutang:', err);
    }
  
    setPiutangPaymentAmount('');
    setIsPiutangModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
     

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        
        {/* Kontainer untuk Hutang Mendekati Jatuh Tempo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span role="img" aria-label="alarm" className="mr-2">⏰</span> Hutang Mendekati Jatuh Tempo
          </h2>
          {upcomingHutang.length === 0 ? (
            <p className="text-gray-500">Tidak ada hutang yang mendekati jatuh tempo.</p>
          ) : (
            <ul>
              {upcomingHutang.map(item => (
                <li key={item._id} className="border-b last:border-b-0 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-md font-semibold">{item.namaSuplier}</p>
                    <p className="text-sm text-gray-500">Jatuh Tempo: {new Date(item.tanggalJatuhTempo).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-red-500">Rp{item.sisaHutang.toLocaleString('id-ID')}</p>
                  </div>
                  <button
                    onClick={() => openHutangPaymentModal(item._id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-200"
                  >
                    Bayar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Kontainer untuk Piutang Mendekati Jatuh Tempo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span role="img" aria-label="money-bag" className="mr-2">💰</span> Piutang Mendekati Jatuh Tempo
          </h2>
          {upcomingPiutang.length === 0 ? (
            <p className="text-gray-500">Tidak ada piutang yang mendekati jatuh tempo.</p>
          ) : (
            <ul>
              {upcomingPiutang.map(item => (
                <li key={item._id} className="border-b last:border-b-0 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-md font-semibold">{item.namaKustomer}</p>
                    <p className="text-sm text-gray-500">Jatuh Tempo: {new Date(item.tanggalJatuhTempo).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-blue-500">Rp{item.sisaPiutang.toLocaleString('id-ID')}</p>
                  </div>
                  <button
                    onClick={() => openPiutangPaymentModal(item._id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-200"
                  >
                    Bayar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal Pembayaran Hutang */}
      {isHutangModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Bayar Hutang</h3>
            <form onSubmit={handleHutangPayment}>
              <label htmlFor="hutangPaymentAmount" className="block text-sm font-medium text-gray-700">
                Nominal Pembayaran
              </label>
              <input
                type="number"
                id="hutangPaymentAmount"
                value={hutangPaymentAmount}
                onChange={(e) => setHutangPaymentAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
                placeholder="Masukkan nominal"
                required
              />
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsHutangModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                >
                  Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal Pembayaran Piutang */}
      {isPiutangModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Bayar Piutang</h3>
            <form onSubmit={handlePiutangPayment}>
              <label htmlFor="piutangPaymentAmount" className="block text-sm font-medium text-gray-700">
                Nominal Pembayaran
              </label>
              <input
                type="number"
                id="piutangPaymentAmount"
                value={piutangPaymentAmount}
                onChange={(e) => setPiutangPaymentAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
                placeholder="Masukkan nominal"
                required
              />
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPiutangModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                >
                  Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;