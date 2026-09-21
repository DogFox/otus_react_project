import { ProgressSpinner } from 'primereact/progressspinner';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { profile, loading } = useAuth();
  if (loading)
    return (
      <div className="page-loader">
        <ProgressSpinner />
      </div>
    );
  return profile ? <Outlet /> : <Navigate to="/login" replace />;
}
