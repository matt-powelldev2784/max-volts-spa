import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

type Client = Tables<'client'>;

const ViewClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  console.log('clients', clients);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    const { data } = await supabase.from('client').select();
    if (data) setClients(data);
  };

  return <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">View Clients</h1>;
};

export default ViewClients;
