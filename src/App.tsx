import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Tables } from './types/database.types';

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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">Max Volts - DB Test</h1>
    </div>
  );
};

const About = () => {
  return (
    <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">About</h1>
  );
};

const App = () => {
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
