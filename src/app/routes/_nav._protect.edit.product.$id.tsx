import EditProduct from '@/components/editProduct/editProduct';
import { useParams } from 'react-router';

export default function EditProductPage() {
  const { id } = useParams();
  const productId = Number(id);

  return <EditProduct productId={productId} />;
}
