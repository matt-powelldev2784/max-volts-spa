import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';
import { Loader2 } from 'lucide-react';
import ErrorCard from '@/lib/errorCard';

type Client = Tables<'client'>;

const getClients = async () => {
  const { data, error } = await supabase.from('client').select();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? ([] as Client[]);
};

const ViewClients = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
  console.log('data', data);
  console.log('isLoading', isLoading);
  console.log('isError', isError);
  console.log('error', error);

  if (isLoading) return <Loader2 className="animate-spin h-6 w-6 mx-auto mt-4 text-mv-orange" />;
  if (isError) return <ErrorCard message={error?.message || 'An unknown error occurred.'} />;

  return <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">View Clients Page</h1>;
};

export default ViewClients;
