import Login from '@/components/auth/login';
import useAuth from '@/lib/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/view-quotes', { replace: true });
  }, [user, navigate]);

  return <Login />;
}
