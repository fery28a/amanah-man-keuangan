// src/routes.jsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Shared/Layout';
import Dashboard from './pages/Dashboard';
import KasMasuk from './pages/KasMasuk';
import KasKeluar from './pages/KasKeluar';
import Hutang from './pages/Hutang';
import Piutang from './pages/Piutang';
import ItemKeluar from './pages/ItemKeluar';
import Laporan from './pages/Laporan';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: 'kas-masuk',
        element: <KasMasuk />,
      },
      {
        path: 'kas-keluar',
        element: <KasKeluar />,
      },
      {
        path: 'hutang',
        element: <Hutang />,
      },
      {
        path: 'piutang',
        element: <Piutang />,
      },
      {
        path: 'item-keluar',
        element: <ItemKeluar />,
      },
      {
        path: 'laporan',
        element: <Laporan />,
      },
    ],
  },
]);

export default router;