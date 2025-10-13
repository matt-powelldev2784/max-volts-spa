import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

type Client = Tables<'product'>;

const ViewProducts = () => {
  const [products, setProducts] = useState<Client[]>([]);
  console.log('products', products);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    const { data } = await supabase.from('product').select();
    if (data) setProducts(data);
  };

  return <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">View Products</h1>;
};

export default ViewProducts;
