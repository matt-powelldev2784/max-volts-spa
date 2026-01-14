import Login from '@/components/auth/login';
import useAuth from '@/lib/useAuth';
import { Outlet } from 'react-router';

const ProtectedLayouts = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <></>;
  }

  if (!user) {
    localStorage.clear();
    sessionStorage.clear();

    return <Login />;
  }

  return <Outlet />;
};

export default ProtectedLayouts;
