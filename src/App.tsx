import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Tables } from './types/database.types';
import useAuth from './lib/useAuth';

type Client = Tables<'client'>;

const Login = () => {
  const { user } = useAuth();
  console.log('user', user);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/protected` },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">
        {user ? user.email : 'Not Logged In'}
      </h1>
      <div className="flex gap-8">
        <button className="bg-blue-500 text-white px-8 py-2" onClick={login}>
          Login
        </button>

        <button className="bg-blue-500 text-white px-8 py-2" onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

const Protected = () => {
  const [clients, setClients] = useState<Client[]>([]);
  console.log('clients', clients);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    const { data } = await supabase.from('client').select();
    if (data) setClients(data);
  };

  return (
    <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
      Protected
    </h1>
  );
};

const ProtectedLayouts = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <></>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedLayouts />}>
          <Route path="/protected" element={<Protected />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
