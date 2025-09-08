import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';
import {
  PencilIcon,
  ShoppingBagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const API_URL = '/api/piutang';

const getDueDateColor = (dueDate) => {
  const today = new Date();
  const tempo = new Date(dueDate);
  const diffTime = tempo.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 3) return 'border-red-500';
  if (diffDays < 10) return 'border-yellow-500';
  return 'border-green-500';
};

const Piutang = () => {
  const { piutangData, setPiutangData } = useContext(DataKeuanganContext);
  
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('');
  const [nominal, setNominal] = useState('');
  const [namaKustomer, setNamaKustomer] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPiutangId, setSelectedPiutangId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [editingPiutangId, setEditingPiutangId] = useState(null);

  const fetchPiutangData = async () => {
    try {
      const res = await axios.get(API_URL);
      setPiutangData(res.data.data);
    } catch (err) {
      console.error('Error fetching piutang data:', err);
    }
  };

  useEffect(() => {
    fetchPiutangData();
  }, [setPiutangData]);

  useEffect(() => {
    if (piutangData && Array.isArray(piutangData)) {
      const uniqueCustomers = [...new Set(piutangData.map(item => item.namaKustomer))];
      setCustomers(uniqueCustomers.sort());
    }
  }, [piutangData]);

  const handleAddPiutang = async (e) => {
    e.preventDefault();
    const newPiutang = {
      deskripsi,
      tanggalJatuhTempo,
      nominal: parseFloat(nominal),
      namaKustomer,
    };

    try {
      if (editingPiutangId) {
        await axios.put(`${API_URL}/${editingPiutangId}`, newPiutang);
        setEditingPiutangId(null);
      } else {
        await axios.post(API_URL, newPiutang);
      }
      fetchPiutangData();
      setDeskripsi('');
      setTanggalJatuhTempo('');
      setNominal('');
      setNamaKustomer('');
    } catch (err) {
      console.error('Error saving piutang:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingPiutangId(item._id);
    setDeskripsi(item.deskripsi);
    setTanggalJatuhTempo(item.tanggalJatuhTempo.substring(0, 10));
    setNominal(item.nominal);
    setNamaKustomer(item.namaKustomer);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchPiutangData();
      } catch (err) {
        console.error('Error deleting piutang:', err);
      }
    }
  };

  const openPaymentModal = (id) => {
    setSelectedPiutangId(id);
    setIsModalOpen(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const payment = parseFloat(paymentAmount);
    if (!payment || payment <= 0) return;

    const itemToUpdate = piutangData.find(item => item._id === selectedPiutangId);
    const newSisaPiutang = itemToUpdate.sisaPiutang - payment;
    const newStatus = newSisaPiutang <= 0 ? 'Lunas' : 'Belum Lunas';

    try {
      await axios.put(`${API_URL}/${selectedPiutangId}`, {
        sisaPiutang: newSisaPiutang > 0 ? newSisaPiutang : 0,
        statusPembayaran: newStatus,
      });
      fetchPiutangData();
    } catch (err) {
      console.error('Error updating piutang:', err);
    }

    setPaymentAmount('');
    setIsModalOpen(false);
  };
  
  const filteredPiutang = piutangData.filter(item => {
    if (selectedCustomer) {
      return item.namaKustomer === selectedCustomer;
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Piutang</h1>
        <div className="flex space-x-2">
          <div>
            <label htmlFor="customer" className="sr-only">Cari Nama Kustomer</label>
            <select
              id="customer"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
            >
              <option value="">Tampilkan Semua Kustomer</option>
              {customers.map((customer) => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleAddPiutang} className="bg-white p-6 rounded-lg shadow-md mb-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          <div><label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi</label><input type="text" id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div><label htmlFor="namaKustomer" className="block text-sm font-medium text-gray-700">Nama Kustomer</label><input type="text" id="namaKustomer" value={namaKustomer} onChange={(e) => setNamaKustomer(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div><label htmlFor="tanggalJatuhTempo" className="block text-sm font-medium text-gray-700">Jatuh Tempo</label><input type="date" id="tanggalJatuhTempo" value={tanggalJatuhTempo} onChange={(e) => setTanggalJatuhTempo(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div><label htmlFor="nominal" className="block text-sm font-medium text-gray-700">Nominal</label><input type="number" id="nominal" value={nominal} onChange={(e) => setNominal(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div className="w-full">
            <button type="submit" className="w-full px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600">
              {editingPiutangId ? 'Simpan Perubahan' : 'Tambah Piutang'}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPiutang.length > 0 ? (
          filteredPiutang.map(item => (
            <div key={item._id} className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${getDueDateColor(item.tanggalJatuhTempo)}`}>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">{item.namaKustomer}</h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Belum Lunas</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.deskripsi}</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-3"><div className="grid grid-cols-2 gap-2 text-sm"><div className="font-medium text-gray-500">Tanggal Piutang:</div><div className="text-gray-900">{item.tanggal ? new Date(item.tanggal).toLocaleDateString() : '-'}</div><div className="font-medium text-gray-500">Jatuh Tempo:</div><div className="text-gray-900">{new Date(item.tanggalJatuhTempo).toLocaleDateString()}</div><div className="font-medium text-gray-500">Nominal:</div><div className="text-gray-900">Rp{item.nominal.toLocaleString('id-ID')}</div><div className="font-medium text-gray-500">Sisa Piutang:</div><div className="font-bold text-green-600">Rp{item.sisaPiutang.toLocaleString('id-ID')}</div></div></div>
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2">
                <button onClick={() => openPaymentModal(item._id)} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"><ShoppingBagIcon className="h-5 w-5" /></button>
                <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => handleDelete(item._id)} className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"><TrashIcon className="h-5 w-5" /></button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Tidak ada data piutang aktif.</p>
        )}
      </div>
      {isModalOpen && (<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center"><div className="bg-white p-8 rounded-lg shadow-xl w-96"><h3 className="text-xl font-bold mb-4">Bayar Piutang</h3><form onSubmit={handlePayment}><label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">Nominal Pembayaran</label><input type="number" id="paymentAmount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /><div className="mt-6 flex justify-end space-x-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300">Batal</button><button type="submit" className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">Bayar</button></div></form></div></div>)}
    </div>
  );
};

export default Piutang;
