import React, { createContext, useState } from 'react';

const DataKeuanganContext = createContext();

export const DataKeuanganProvider = ({ children }) => {
  const [hutangData, setHutangData] = useState([]);
  const [hutangLunasData, setHutangLunasData] = useState([]);
  const [kasMasukData, setKasMasukData] = useState([]);
  const [kasKeluarData, setKasKeluarData] = useState([]);
  const [piutangData, setPiutangData] = useState([]);
  const [piutangLunasData, setPiutangLunasData] = useState([]);
  const [itemKeluarData, setItemKeluarData] = useState([]);

  const value = {
    hutangData, setHutangData,
    hutangLunasData, setHutangLunasData,
    kasMasukData, setKasMasukData,
    kasKeluarData, setKasKeluarData,
    piutangData, setPiutangData,
    piutangLunasData, setPiutangLunasData,
    itemKeluarData, setItemKeluarData,
  };

  return (
    <DataKeuanganContext.Provider value={value}>
      {children}
    </DataKeuanganContext.Provider>
  );
};

export default DataKeuanganContext;
