import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingBagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const API_URL = '/api/hutang';
const Hutang = () => {
  const { hutangData, setHutangData } = useContext(DataKeuanganContext);
  
  const [deskripsi, setDeskripsi] = useState('');
  const [noTransaksi, setNoTransaksi] = useState('');
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('');
  const [nominal, setNominal] = useState('');
  const [namaSuplier, setNamaSuplier] = useState('');

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

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
      statusInput: false
    };

    try {
      if (editingHutangId) {
        await axios.put(`${API_URL}/${editingHutangId}`, { ...newHutang, sisaHutang: parseFloat(nominal) });
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
  
  const handleToggleInput = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { statusInput: !currentStatus });
      fetchHutangData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredHutang = hutangData.filter(item => {
    const itemDate = new Date(item.tanggalJatuhTempo);
    return itemDate.getMonth() + 1 === parseInt(selectedMonth) && itemDate.getFullYear() === parseInt(selectedYear) && item.statusPembayaran !== 'Lunas';
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hutang</h1>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="month" className="sr-only">Bulan</label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="sr-only">Tahun</label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleAddHutang} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <input
              type="text"
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="Contoh: Beli Bahan Baku"
              required
            />
          </div>
          <div>
            <label htmlFor="namaSuplier" className="block text-sm font-medium text-gray-700">
              Nama Suplier
            </label>
            <input
              type="text"
              id="namaSuplier"
              value={namaSuplier}
              onChange={(e) => setNamaSuplier(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="Contoh: PT. Sumber Jaya"
              required
            />
          </div>
          <div>
            <label htmlFor="noTransaksi" className="block text-sm font-medium text-gray-700">
              No. Transaksi
            </label>
            <input
              type="text"
              id="noTransaksi"
              value={noTransaksi}
              onChange={(e) => setNoTransaksi(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="Contoh: INV-001"
              required
            />
          </div>
          <div>
            <label htmlFor="tanggalJatuhTempo" className="block text-sm font-medium text-gray-700">
              Tanggal Jatuh Tempo
            </label>
            <input
              type="date"
              id="tanggalJatuhTempo"
              value={tanggalJatuhTempo}
              onChange={(e) => setTanggalJatuhTempo(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="nominal" className="block text-sm font-medium text-gray-700">
              Nominal
            </label>
            <input
              type="number"
              id="nominal"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="Contoh: 1000000"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full md:col-span-5 lg:col-span-1 px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600 transition-colors duration-200"
          >
            {editingHutangId ? 'Simpan Perubahan' : 'Tambah Hutang'}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Daftar Hutang</h2>
        {filteredHutang.length === 0 ? (
          <p className="text-gray-500">Tidak ada data hutang untuk bulan ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Suplier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Transaksi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Hutang</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Input</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHutang.map((item, index) => (
                  <tr key={item._id} className={item.statusInput ? 'bg-green-100' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaSuplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.noTransaksi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggalJatuhTempo).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rp{item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-500">Rp{item.sisaHutang.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.statusPembayaran === 'Lunas' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {item.statusPembayaran}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.statusInput && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800">
                          Sudah di Input
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium flex flex-wrap space-x-1 justify-end">
                      {item.statusPembayaran !== 'Lunas' && (
                        <button
                          onClick={() => openPaymentModal(item._id)}
                          className="font-bold py-1 px-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 text-xs mb-1 flex items-center"
                        >
                          <ShoppingBagIcon className="h-4 w-4 mr-1" />
                          Bayar
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleInput(item._id, item.statusInput)}
                        className={`font-bold py-1 px-2 rounded-md transition-colors duration-200 text-xs mb-1 flex items-center ${
                          item.statusInput
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {item.statusInput ? <XMarkIcon className="h-4 w-4 mr-1" /> : <CheckIcon className="h-4 w-4 mr-1" />}
                        {item.statusInput ? 'Batal' : 'Input'}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="font-bold py-1 px-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 text-xs mb-1 flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="font-bold py-1 px-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200 text-xs mb-1 flex items-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Bayar Hutang</h3>
            <form onSubmit={handlePayment}>
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
                Nominal Pembayaran
              </label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
                placeholder="Masukkan nominal"
                required
              />
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

export default Hutang;
