import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Tables } from './types/database.types';
import useAuth from './lib/useAuth';

type Client = Tables<'client'>;

const Home = () => {
  const [clients, setClients] = useState<Client[]>([]);
  console.log('clients', clients);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    const { data } = await supabase.from('client').select();
    if (data) setClients(data);
  };

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/about` },
    });
  };

  const logOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">Max Volts - DB Test</h1>
      <div className="flex gap-8">
        <button className="bg-blue-500 text-white px-8 py-2" onClick={login}>
          Login
        </button>

        <button className="bg-blue-500 text-white px-8 py-2" onClick={logOut}>
          Log Out
        </button>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">About</h1>
  );
};

const App = () => {
  const { user } = useAuth();
  console.log('user', user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;
