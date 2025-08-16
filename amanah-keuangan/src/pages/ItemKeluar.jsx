// src/pages/ItemKeluar.jsx
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';
import { PencilIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const API_URL = '/api/itemkeluar';
const ItemKeluar = () => {
  const { itemKeluarData, setItemKeluarData } = useContext(DataKeuanganContext);
  const [kodeItem, setKodeItem] = useState('');
  const [namaItem, setNamaItem] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [satuan, setSatuan] = useState('');
  const [editingItemKeluarId, setEditingItemKeluarId] = useState(null);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  const fetchItemKeluarData = async () => {
    try {
      const res = await axios.get(API_URL);
      setItemKeluarData(res.data.data);
    } catch (err) {
      console.error('Error fetching item keluar data:', err);
    }
  };

  useEffect(() => {
    fetchItemKeluarData();
  }, [setItemKeluarData]);

  const handleAddItemKeluar = async (e) => {
    e.preventDefault();
    const newItemKeluar = {
      kodeItem,
      namaItem,
      deskripsi,
      tanggal: today.toISOString().slice(0, 10),
      jumlah: parseFloat(jumlah),
      satuan,
    };

    try {
      if (editingItemKeluarId) {
        await axios.put(`${API_URL}/${editingItemKeluarId}`, newItemKeluar);
        setEditingItemKeluarId(null);
      } else {
        await axios.post(API_URL, newItemKeluar);
      }
      fetchItemKeluarData();
      setKodeItem('');
      setNamaItem('');
      setDeskripsi('');
      setJumlah('');
      setSatuan('');
    } catch (err) {
      console.error('Error saving item keluar:', err);
    }
  };

  const handleEdit = (item) => {
    setEditingItemKeluarId(item._id);
    setKodeItem(item.kodeItem);
    setNamaItem(item.namaItem);
    setDeskripsi(item.deskripsi);
    setJumlah(item.jumlah);
    setSatuan(item.satuan);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchItemKeluarData();
      } catch (err) {
        console.error('Error deleting item keluar:', err);
      }
    }
  };

  const handleToggleInput = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { statusInput: !currentStatus });
      fetchItemKeluarData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredItemKeluar = itemKeluarData.filter(item => {
    const itemDate = new Date(item.tanggal);
    return itemDate.getMonth() + 1 === parseInt(selectedMonth) && itemDate.getFullYear() === parseInt(selectedYear);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Item Keluar</h1>
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

      <form onSubmit={handleAddItemKeluar} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label htmlFor="kodeItem" className="block text-sm font-medium text-gray-700">
              Kode Item
            </label>
            <input
              type="text"
              id="kodeItem"
              value={kodeItem}
              onChange={(e) => setKodeItem(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
              placeholder="Contoh: ITM-001"
              required
            />
          </div>
          <div>
            <label htmlFor="namaItem" className="block text-sm font-medium text-gray-700">
              Nama Item
            </label>
            <input
              type="text"
              id="namaItem"
              value={namaItem}
              onChange={(e) => setNamaItem(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
              placeholder="Contoh: Laptop"
              required
            />
          </div>
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
              placeholder="Contoh: Untuk Karyawan Baru"
              required
            />
          </div>
          <div>
            <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
              Jumlah
            </label>
            <input
              type="number"
              id="jumlah"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
              placeholder="Contoh: 1"
              required
            />
          </div>
          <div>
            <label htmlFor="satuan" className="block text-sm font-medium text-gray-700">
              Satuan
            </label>
            <input
              type="text"
              id="satuan"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2"
              placeholder="Contoh: Unit"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full md:col-span-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
          >
            {editingItemKeluarId ? 'Simpan Perubahan' : 'Tambah Item Keluar'}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Daftar Item Keluar</h2>
        {filteredItemKeluar.length === 0 ? (
          <p className="text-gray-500">Tidak ada data item keluar untuk bulan ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Item</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Input</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItemKeluar.map((item, index) => (
                  <tr key={item._id} className={item.statusInput ? 'bg-green-100' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggal).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.kodeItem}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaItem}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.jumlah}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.satuan}</td>
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

export default ItemKeluar;
