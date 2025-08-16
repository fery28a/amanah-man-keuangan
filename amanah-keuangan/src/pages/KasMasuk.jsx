import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';
import { PencilIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const API_URL = '/api/kasmasuk';

const KasMasuk = () => {
  const { kasMasukData, setKasMasukData } = useContext(DataKeuanganContext);
  const [deskripsi, setDeskripsi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [nominal, setNominal] = useState('');
  const [editingKasMasukId, setEditingKasMasukId] = useState(null);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  const fetchKasMasukData = async () => {
    try {
      const res = await axios.get(API_URL);
      setKasMasukData(res.data.data);
    } catch (err) {
      console.error('Error fetching kas masuk data:', err);
    }
  };

  useEffect(() => {
    fetchKasMasukData();
  }, [setKasMasukData]);

  const handleAddKasMasuk = async (e) => {
    e.preventDefault();
    const newKasMasuk = {
      deskripsi,
      tanggal,
      nominal: parseFloat(nominal),
    };

    try {
      if (editingKasMasukId) {
        await axios.put(`${API_URL}/${editingKasMasukId}`, newKasMasuk);
        setEditingKasMasukId(null);
      } else {
        await axios.post(API_URL, newKasMasuk);
      }
      fetchKasMasukData();
      setDeskripsi('');
      setTanggal('');
      setNominal('');
    } catch (err) {
      console.error('Error saving kas masuk:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingKasMasukId(item._id);
    setDeskripsi(item.deskripsi);
    setTanggal(item.tanggal.substring(0, 10));
    setNominal(item.nominal);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchKasMasukData();
      } catch (err) {
        console.error('Error deleting kas masuk:', err);
      }
    }
  };

  const handleToggleInput = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { statusInput: !currentStatus });
      fetchKasMasukData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredKasMasuk = kasMasukData.filter(item => {
    const itemDate = new Date(item.tanggal);
    return itemDate.getMonth() + 1 === parseInt(selectedMonth) && itemDate.getFullYear() === parseInt(selectedYear);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kas Masuk</h1>
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

      <form onSubmit={handleAddKasMasuk} className="bg-white p-6 rounded-lg shadow-md mb-8">
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
              placeholder="Contoh: Penjualan Produk A"
              required
            />
          </div>
          <div>
            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">
              Tanggal
            </label>
            <input
              type="date"
              id="tanggal"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
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
              placeholder="Contoh: 500000"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full md:col-span-1 px-4 py-2 bg-yellow-500 text-white font-bold rounded-md hover:bg-yellow-600"
          >
            {editingKasMasukId ? 'Simpan Perubahan' : 'Tambah Kas Masuk'}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Daftar Kas Masuk</h2>
        {filteredKasMasuk.length === 0 ? (
          <p className="text-gray-500">Tidak ada data kas masuk untuk bulan ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Input</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKasMasuk.map((item, index) => (
                  <tr key={item._id} className={item.statusInput ? 'bg-green-100' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggal).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-500">Rp{item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm">
                      {item.statusInput && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800">
                          Sudah di Input
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium flex flex-wrap space-x-1 justify-end">
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
    </div>
  );
};

export default KasMasuk;
