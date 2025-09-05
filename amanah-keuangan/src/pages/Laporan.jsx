import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import DataKeuanganContext from '../context/DataKeuanganContext';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const API_URLS = {
  kasMasuk: '/api/kasmasuk',
  kasKeluar: '/api/kaskeluar',
  hutang: '/api/hutang',
  hutangLunas: '/api/hutang/lunas', // URL baru untuk hutang lunas
  piutang: '/api/piutang',
  itemKeluar: '/api/itemkeluar',
};

const Laporan = () => {
  const {
    kasMasukData, setKasMasukData,
    kasKeluarData, setKasKeluarData,
    hutangData, setHutangData,
    hutangLunasData, setHutangLunasData, // Ambil dari context
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
        const [kasMasukRes, kasKeluarRes, hutangRes, hutangLunasRes, piutangRes, itemKeluarRes] = await Promise.all([
          axios.get(API_URLS.kasMasuk),
          axios.get(API_URLS.kasKeluar),
          axios.get(API_URLS.hutang),
          axios.get(API_URLS.hutangLunas), // Fetch data hutang lunas
          axios.get(API_URLS.piutang),
          axios.get(API_URLS.itemKeluar),
        ]);
        
        setKasMasukData(kasMasukRes.data.data);
        setKasKeluarData(kasKeluarRes.data.data);
        setHutangData(hutangRes.data.data);
        setHutangLunasData(hutangLunasRes.data.data); // Set data hutang lunas
        setPiutangData(piutangRes.data.data);
        setItemKeluarData(itemKeluarRes.data.data);
      } catch (err) {
        console.error('Error fetching laporan data:', err);
      }
    };
    fetchData();
  }, [setKasMasukData, setKasKeluarData, setHutangData, setHutangLunasData, setPiutangData, setItemKeluarData]);

  const getFilteredData = () => {
    const dataMap = {
      kasMasuk: kasMasukData,
      kasKeluar: kasKeluarData,
      hutang: hutangData,
      hutangLunas: hutangLunasData, // Tambahkan hutang lunas ke map
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
      // Logika ekspor untuk hutang lunas
      if (selectedReport === 'hutangLunas') {
        return {
          'No. Transaksi': item.noTransaksi,
          'Nama Suplier': item.namaSuplier,
          Deskripsi: item.deskripsi,
          'Tanggal Lunas': new Date(item.updatedAt).toLocaleDateString(),
          Nominal: item.nominal,
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
      hutangLunas: ['No', 'Nama Suplier', 'No. Transaksi', 'Tanggal Lunas', 'Nominal', 'Status Pembayaran'], // Header untuk hutang lunas
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
                ) : selectedReport === 'hutangLunas' ? ( // Logika render untuk hutang lunas
                  <>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.namaSuplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.noTransaksi}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(item.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Rp{item.nominal.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800">
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
    // ... (Fungsi renderSummary tidak perlu diubah)
  };

  return (
    <div className="p-6">
        {/* ... (Bagian header tidak berubah) ... */}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Pilih Laporan</h2>
        <div className="flex flex-wrap gap-2">
          {/* ... (Tombol lainnya) ... */}
          <button
            onClick={() => setSelectedReport('hutang')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'hutang' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Hutang
          </button>
          {/* Tombol baru untuk Hutang Lunas */}
          <button
            onClick={() => setSelectedReport('hutangLunas')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              selectedReport === 'hutangLunas' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Hutang Lunas
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
      
      {/* ... (Bagian render ringkasan atau tabel tidak berubah) ... */}
    </div>
  );
};

export default Laporan;
