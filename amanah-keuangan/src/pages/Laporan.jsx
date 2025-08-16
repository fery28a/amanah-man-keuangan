import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import DataKeuanganContext from '../context/DataKeuanganContext';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const API_URLS = {
  kasMasuk: '/api/kasmasuk',
  kasKeluar: '/api/kaskeluar',
  hutang: '/api/hutang',
  piutang: '/api/piutang',
  itemKeluar: '/api/itemkeluar',
};

const Laporan = () => {
  const {
    kasMasukData, setKasMasukData,
    kasKeluarData, setKasKeluarData,
    hutangData, setHutangData,
    piutangData, setPiutangData,
    itemKeluarData, setItemKeluarData
  } = useContext(DataKeuanganContext);
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedReport, setSelectedReport] = useState('summary');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kasMasukRes, kasKeluarRes, hutangRes, piutangRes, itemKeluarRes] = await Promise.all([
          axios.get(API_URLS.kasMasuk),
          axios.get(API_URLS.kasKeluar),
          axios.get(API_URLS.hutang),
          axios.get(API_URLS.piutang),
          axios.get(API_URLS.itemKeluar),
        ]);
        
        setKasMasukData(kasMasukRes.data.data);
        setKasKeluarData(kasKeluarRes.data.data);
        setHutangData(hutangRes.data.data);
        setPiutangData(piutangRes.data.data);
        setItemKeluarData(itemKeluarRes.data.data);
      } catch (err) {
        console.error('Error fetching laporan data:', err);
      }
    };
    fetchData();
  }, [setKasMasukData, setKasKeluarData, setHutangData, setPiutangData, setItemKeluarData]);

  const getFilteredData = () => {
    const dataMap = {
      kasMasuk: kasMasukData,
      kasKeluar: kasKeluarData,
      hutang: hutangData,
      piutang: piutangData,
      itemKeluar: itemKeluarData,
    };
    
    return dataMap[selectedReport]?.filter(item => {
      const itemDate = new Date(item.tanggal || item.tanggalJatuhTempo);
      return itemDate.getMonth() + 1 === parseInt(selectedMonth) && itemDate.getFullYear() === parseInt(selectedYear);
    }) || [];
  };

  const exportToExcel = () => {
    const dataToExport = getFilteredData().map(item => {
      if (selectedReport === 'kasMasuk' || selectedReport === 'kasKeluar') {
        return {
          Tanggal: new Date(item.tanggal).toLocaleDateString(),
          Deskripsi: item.deskripsi,
          Nominal: item.nominal,
        };
      }
      if (selectedReport === 'hutang') {
        return {
          'No. Transaksi': item.noTransaksi,
          'Nama Suplier': item.namaSuplier,
          Deskripsi: item.deskripsi,
          'Jatuh Tempo': new Date(item.tanggalJatuhTempo).toLocaleDateString(),
          Nominal: item.nominal,
          'Sisa Hutang': item.sisaHutang,
          'Status Pembayaran': item.statusPembayaran,
        };
      }
      if (selectedReport === 'piutang') {
        return {
          Deskripsi: item.deskripsi,
          'Nama Kustomer': item.namaKustomer,
          'Jatuh Tempo': new Date(item.tanggalJatuhTempo).toLocaleDateString(),
          Nominal: item.nominal,
          'Sisa Piutang': item.sisaPiutang,
          'Status Pembayaran': item.statusPembayaran,
        };
      }
      if (selectedReport === 'itemKeluar') {
        return {
          Tanggal: new Date(item.tanggal).toLocaleDateString(),
          'Kode Item': item.kodeItem,
          'Nama Item': item.namaItem,
          Deskripsi: item.deskripsi,
          Jumlah: item.jumlah,
          Satuan: item.satuan,
        };
      }
      return item;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, `laporan_${selectedReport}_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const renderTable = () => {
    const data = getFilteredData();
    const tableHeaders = {
      kasMasuk: ['No', 'Tanggal', 'Deskripsi', 'Nominal'],
      kasKeluar: ['No', 'Tanggal', 'Deskripsi', 'Nominal'],
      hutang: ['No', 'Nama Suplier', 'No. Transaksi', 'Jatuh Tempo', 'Nominal', 'Sisa Hutang', 'Status Pembayaran'],
      piutang: ['No', 'Nama Kustomer', 'Jatuh Tempo', 'Nominal', 'Sisa Piutang', 'Status Pembayaran'],
      itemKeluar: ['No', 'Tanggal', 'Nama Item', 'Deskripsi', 'Jumlah', 'Satuan'],
    };
    
    if (data.length === 0) {
      return <p className="text-gray-500">Tidak ada data untuk laporan ini.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders[selectedReport].map((header, index) => (
                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item._id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                {selectedReport === 'kasMasuk' || selectedReport === 'kasKeluar' ? (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggal).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">Rp{item.nominal.toLocaleString('id-ID')}</td>
                  </>
                ) : selectedReport === 'hutang' ? (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaSuplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.noTransaksi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggalJatuhTempo).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rp{item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-500">Rp{item.sisaHutang.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.statusPembayaran === 'Lunas' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {item.statusPembayaran}
                      </span>
                    </td>
                  </>
                ) : selectedReport === 'piutang' ? (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaKustomer}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggalJatuhTempo).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rp{item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-500">Rp{item.sisaPiutang.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.statusPembayaran === 'Lunas' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {item.statusPembayaran}
                      </span>
                    </td>
                  </>
                ) : selectedReport === 'itemKeluar' ? (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.tanggal).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaItem}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.jumlah}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.satuan}</td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummary = () => {
    const totalKasMasuk = kasMasukData.reduce((acc, item) => acc + item.nominal, 0);
    const totalKasKeluar = kasKeluarData.reduce((acc, item) => acc + item.nominal, 0);
    const saldoAkhir = totalKasMasuk - totalKasKeluar;

    const totalHutang = hutangData.reduce((acc, item) => acc + item.sisaHutang, 0);
    const totalPiutang = piutangData.reduce((acc, item) => acc + item.sisaPiutang, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total Kas Masuk</h2>
          <p className="text-3xl font-bold text-green-500 mt-2">Rp{totalKasMasuk.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total Kas Keluar</h2>
          <p className="text-3xl font-bold text-red-500 mt-2">Rp{totalKasKeluar.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total Hutang</h2>
          <p className="text-3xl font-bold text-yellow-500 mt-2">Rp{totalHutang.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Total Piutang</h2>
          <p className="text-3xl font-bold text-blue-500 mt-2">Rp{totalPiutang.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md col-span-full">
          <h2 className="text-2xl font-semibold text-gray-700">Saldo Akhir</h2>
          <p className="text-4xl font-bold text-indigo-600 mt-2">Rp{saldoAkhir.toLocaleString('id-ID')}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Laporan Keuangan</h1>
        
        {selectedReport !== 'summary' && (
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
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Laporan</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedReport('summary')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'summary' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setSelectedReport('kasMasuk')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'kasMasuk' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Kas Masuk
          </button>
          <button
            onClick={() => setSelectedReport('kasKeluar')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'kasKeluar' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Kas Keluar
          </button>
          <button
            onClick={() => setSelectedReport('hutang')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'hutang' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Hutang
          </button>
          <button
            onClick={() => setSelectedReport('piutang')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'piutang' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Piutang
          </button>
          <button
            onClick={() => setSelectedReport('itemKeluar')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'itemKeluar' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Item Keluar
          </button>
        </div>
      </div>
      
      {selectedReport === 'summary' ? (
        renderSummary()
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Laporan {selectedReport}</h2>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Export ke Excel
            </button>
          </div>
          {renderTable()}
        </div>
      )}
    </div>
  );
};

export default Laporan;
