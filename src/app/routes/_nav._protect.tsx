import useAuth from '@/lib/useAuth';
import { Navigate, Outlet } from 'react-router';

const ProtectedLayouts = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <></>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ProtectedLayouts;
