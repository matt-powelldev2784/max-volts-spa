import Login from '@/components/auth/login';
import useAuth from '@/lib/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/view-quotes', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return <Login />;
}
