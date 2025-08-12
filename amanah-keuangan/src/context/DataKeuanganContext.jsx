// src/context/DataKeuanganContext.jsx
import React, { createContext, useState } from 'react';

const DataKeuanganContext = createContext();

export const DataKeuanganProvider = ({ children }) => {
  const [hutangData, setHutangData] = useState([]);
  const [kasMasukData, setKasMasukData] = useState([]);
  const [kasKeluarData, setKasKeluarData] = useState([]);
  const [piutangData, setPiutangData] = useState([]);
  const [itemKeluarData, setItemKeluarData] = useState([]);

  const value = {
    hutangData, setHutangData,
    kasMasukData, setKasMasukData,
    kasKeluarData, setKasKeluarData,
    piutangData, setPiutangData,
    itemKeluarData, setItemKeluarData,
  };

  return (
    <DataKeuanganContext.Provider value={value}>
      {children}
    </DataKeuanganContext.Provider>
  );
};

export default DataKeuanganContext;