import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';
import {
  PencilIcon,
  ShoppingBagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const API_URL = '/api/hutang';

const getDueDateColor = (dueDate) => {
  const today = new Date();
  const tempo = new Date(dueDate);
  const diffTime = tempo.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 3) return 'border-red-500';
  if (diffDays < 10) return 'border-yellow-500';
  return 'border-green-500';
};

const Hutang = () => {
  const { hutangData, setHutangData } = useContext(DataKeuanganContext);
  
  const [deskripsi, setDeskripsi] = useState('');
  const [noTransaksi, setNoTransaksi] = useState('');
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('');
  const [nominal, setNominal] = useState('');
  const [namaSuplier, setNamaSuplier] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHutangId, setSelectedHutangId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [editingHutangId, setEditingHutangId] = useState(null);

  const fetchHutangData = async () => {
    try {
      const res = await axios.get(API_URL);
      setHutangData(res.data.data);
    } catch (err) {
      console.error('Error fetching hutang data:', err);
    }
  };

  useEffect(() => {
    fetchHutangData();
  }, [setHutangData]);

  useEffect(() => {
    if (hutangData && Array.isArray(hutangData)) {
      const uniqueSuppliers = [...new Set(hutangData.map(item => item.namaSuplier))];
      setSuppliers(uniqueSuppliers.sort());
    }
  }, [hutangData]);

  const handleAddHutang = async (e) => {
    e.preventDefault();
    const newHutang = {
      deskripsi,
      noTransaksi,
      tanggalJatuhTempo,
      nominal: parseFloat(nominal),
      namaSuplier,
      sisaHutang: parseFloat(nominal),
      statusPembayaran: 'Belum Lunas',
    };

    try {
      if (editingHutangId) {
        await axios.put(`${API_URL}/${editingHutangId}`, newHutang);
        setEditingHutangId(null);
      } else {
        await axios.post(API_URL, newHutang);
      }
      fetchHutangData();
      setDeskripsi('');
      setNoTransaksi('');
      setTanggalJatuhTempo('');
      setNominal('');
      setNamaSuplier('');
    } catch (err) {
      console.error('Error saving hutang:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingHutangId(item._id);
    setDeskripsi(item.deskripsi);
    setNoTransaksi(item.noTransaksi);
    setTanggalJatuhTempo(item.tanggalJatuhTempo.substring(0, 10));
    setNominal(item.nominal);
    setNamaSuplier(item.namaSuplier);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchHutangData();
      } catch (err) {
        console.error('Error deleting hutang:', err);
      }
    }
  };

  const openPaymentModal = (id) => {
    setSelectedHutangId(id);
    setIsModalOpen(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const payment = parseFloat(paymentAmount);
    if (!payment || payment <= 0) return;

    const itemToUpdate = hutangData.find(item => item._id === selectedHutangId);
    const newSisaHutang = itemToUpdate.sisaHutang - payment;
    const newStatus = newSisaHutang <= 0 ? 'Lunas' : 'Belum Lunas';

    try {
      await axios.put(`${API_URL}/${selectedHutangId}`, {
        sisaHutang: newSisaHutang > 0 ? newSisaHutang : 0,
        statusPembayaran: newStatus,
      });
      fetchHutangData();
    } catch (err) {
      console.error('Error updating hutang:', err);
    }

    setPaymentAmount('');
    setIsModalOpen(false);
  };

  const filteredHutang = hutangData.filter(item => {
    if (selectedSupplier) {
      return item.namaSuplier === selectedSupplier;
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Hutang</h1>
        <div className="flex space-x-2">
          <div>
            <label htmlFor="supplier" className="sr-only">Cari Nama Suplier</label>
            <select
              id="supplier"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
            >
              <option value="">Tampilkan Semua Suplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleAddHutang} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
          <div><label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi</label><input type="text" id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div><label htmlFor="namaSuplier" className="block text-sm font-medium text-gray-700">Nama Suplier</label><input type="text" id="namaSuplier" value={namaSuplier} onChange={(e) => setNamaSuplier(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div><label htmlFor="noTransaksi" className="block text-sm font-medium text-gray-700">No. Transaksi</label><input type="text" id="noTransaksi" value={noTransaksi} onChange={(e) => setNoTransaksi(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div><label htmlFor="tanggalJatuhTempo" className="block text-sm font-medium text-gray-700">Jatuh Tempo</label><input type="date" id="tanggalJatuhTempo" value={tanggalJatuhTempo} onChange={(e) => setTanggalJatuhTempo(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div><label htmlFor="nominal" className="block text-sm font-medium text-gray-700">Nominal</label><input type="number" id="nominal" value={nominal} onChange={(e) => setNominal(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /></div>
          <div className="w-full">
            <button type="submit" className="w-full px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600">
              {editingHutangId ? 'Simpan Perubahan' : 'Tambah Hutang'}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHutang.length > 0 ? (
          filteredHutang.map(item => (
            <div key={item._id} className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${getDueDateColor(item.tanggalJatuhTempo)}`}>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">{item.namaSuplier}</h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Belum Lunas</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.deskripsi}</p>
                <p className="text-xs text-gray-500">No. {item.noTransaksi}</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-3"><div className="grid grid-cols-2 gap-2 text-sm"><div className="font-medium text-gray-500">Tanggal Hutang:</div><div className="text-gray-900">{item.tanggal ? new Date(item.tanggal).toLocaleDateString() : '-'}</div><div className="font-medium text-gray-500">Jatuh Tempo:</div><div className="text-gray-900">{new Date(item.tanggalJatuhTempo).toLocaleDateString()}</div><div className="font-medium text-gray-500">Nominal:</div><div className="text-gray-900">Rp{item.nominal.toLocaleString('id-ID')}</div><div className="font-medium text-gray-500">Sisa Hutang:</div><div className="font-bold text-red-600">Rp{item.sisaHutang.toLocaleString('id-ID')}</div></div></div>
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2">
                <button onClick={() => openPaymentModal(item._id)} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"><ShoppingBagIcon className="h-5 w-5" /></button>
                <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => handleDelete(item._id)} className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"><TrashIcon className="h-5 w-5" /></button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">Tidak ada data hutang aktif.</p>
        )}
      </div>

      {isModalOpen && (<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center"><div className="bg-white p-8 rounded-lg shadow-xl w-96"><h3 className="text-xl font-bold mb-4">Bayar Hutang</h3><form onSubmit={handlePayment}><label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">Nominal Pembayaran</label><input type="number" id="paymentAmount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2" required /><div className="mt-6 flex justify-end space-x-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300">Batal</button><button type="submit" className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">Bayar</button></div></form></div></div>)}
    </div>
  );
};

export default Hutang;
