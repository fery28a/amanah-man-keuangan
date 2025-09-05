import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import DataKeuanganContext from '../context/DataKeuanganContext';

const API_URL = '/api/hutang/lunas';

const HutangLunas = () => {
  const { hutangLunasData, setHutangLunasData } = useContext(DataKeuanganContext);
  const [filteredHutang, setFilteredHutang] = useState([]);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  useEffect(() => {
    const fetchHutangLunasData = async () => {
      try {
        const res = await axios.get(API_URL);
        setHutangLunasData(res.data.data);
      } catch (err) {
        console.error('Error fetching hutang lunas data:', err);
      }
    };
    fetchHutangLunasData();
  }, [setHutangLunasData]);

  useEffect(() => {
    const filteredData = hutangLunasData.filter(item => {
        const itemDate = new Date(item.tanggalJatuhTempo);
        return itemDate.getMonth() + 1 === parseInt(selectedMonth) && itemDate.getFullYear() === parseInt(selectedYear);
    });
    setFilteredHutang(filteredData);
  }, [hutangLunasData, selectedMonth, selectedYear]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Hutang Lunas</h1>
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Daftar Hutang Lunas</h2>
        {filteredHutang.length === 0 ? (
          <p className="text-gray-500">Tidak ada data hutang lunas untuk bulan ini.</p>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pembayaran</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHutang.map((item, index) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaSuplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.noTransaksi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggalJatuhTempo).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rp{item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800">
                        {item.statusPembayaran}
                      </span>
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

export default HutangLunas;
