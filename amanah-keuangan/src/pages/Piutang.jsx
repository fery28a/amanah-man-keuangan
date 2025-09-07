import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';
import { PencilIcon, CheckIcon, XMarkIcon, ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';

const API_URL = '/api/piutang';

const Piutang = () => {
  const { piutangData, setPiutangData } = useContext(DataKeuanganContext);
  
  // State untuk form input
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('');
  const [nominal, setNominal] = useState('');
  const [namaKustomer, setNamaKustomer] = useState('');

  // State untuk filter
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(''); // State baru untuk kustomer terpilih

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  // State untuk modal dan editing
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
  
  // useEffect baru untuk membuat daftar kustomer unik
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
  
  const handleToggleInput = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { statusInput: !currentStatus });
      fetchPiutangData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Logika filter diperbarui untuk menyertakan filter kustomer
  const filteredPiutang = piutangData
    .filter(item => {
        // Filter berdasarkan kustomer jika dipilih
        if (selectedCustomer) {
            return item.namaKustomer === selectedCustomer;
        }
        return true;
    })
    .filter(item => {
        // Filter berdasarkan bulan dan tahun, hanya jika tidak ada kustomer yang dipilih
        if (!selectedCustomer) {
            const itemDate = new Date(item.tanggalJatuhTempo);
            return itemDate.getMonth() + 1 === parseInt(selectedMonth) && itemDate.getFullYear() === parseInt(selectedYear);
        }
        return true;
    });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Piutang</h1>
        {/* Kolom filter baru */}
        <div className="flex space-x-2">
          <div>
            <label htmlFor="customer" className="sr-only">Kustomer</label>
            <select
              id="customer"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="mt-1 block rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
            >
              <option value="">Semua Kustomer</option>
              {customers.map((customer) => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>
          </div>
          {/* Filter bulan dan tahun disembunyikan jika kustomer dipilih */}
          {!selectedCustomer && (
            <>
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
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleAddPiutang} className="bg-white p-6 rounded-lg shadow-md mb-8">
        {/* ... Form input tidak berubah ... */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <input
              type="text"
              id="deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
              placeholder="Contoh: Jual Produk C"
              required
            />
          </div>
          <div>
            <label htmlFor="namaKustomer" className="block text-sm font-medium text-gray-700">
              Nama Kustomer
            </label>
            <input
              type="text"
              id="namaKustomer"
              value={namaKustomer}
              onChange={(e) => setNamaKustomer(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
              placeholder="Contoh: Budi Santoso"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
              placeholder="Contoh: 800000"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full md:col-span-1 px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600"
          >
            {editingPiutangId ? 'Simpan Perubahan' : 'Tambah Piutang'}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Daftar Piutang</h2>
        {/* ... Tabel dan isinya tidak berubah ... */}
        {filteredPiutang.length === 0 ? (
          <p className="text-gray-500">Tidak ada data piutang yang sesuai dengan filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kustomer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Piutang</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Input</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPiutang.map((item, index) => (
                  <tr key={item._id} className={item.statusInput ? 'bg-green-100' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaKustomer}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggalJatuhTempo).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rp{item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-500">Rp{item.sisaPiutang.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-800`}
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

      {/* ... Modal pembayaran tidak berubah ... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Bayar Piutang</h3>
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

export default Piutang;
