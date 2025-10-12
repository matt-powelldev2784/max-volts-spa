import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

type Quote = Tables<'quote'>;

const ViewQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  console.log('quotes', quotes);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    const { data } = await supabase.from('quote').select();
    if (data) setQuotes(data);
  };

  return (
    <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
      View Quotes
    </h1>
  );
};

export default ViewQuotes;
