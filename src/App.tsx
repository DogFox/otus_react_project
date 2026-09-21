import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/AuthPages';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  const toast = useRef<Toast>(null);
  const notify = (severity: 'success' | 'error', detail: string) =>
    toast.current?.show({
      severity,
      summary: severity === 'success' ? 'Готово' : 'Ошибка',
      detail,
      life: 3500,
    });
  return (
    <HashRouter>
      <Toast ref={toast} />
      <Layout>
        <Routes>
          <Route path="/" element={<CatalogPage notify={notify} />} />
          <Route path="/cart" element={<CartPage notify={notify} />} />
          <Route path="/login" element={<AuthPage mode="login" notify={notify} />} />
          <Route path="/register" element={<AuthPage mode="register" notify={notify} />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage notify={notify} />} />
            <Route path="/orders" element={<OrdersPage notify={notify} />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
export default App;
