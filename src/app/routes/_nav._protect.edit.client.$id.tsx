import EditClient from '@/components/editClient/editClient';
import { useParams } from 'react-router';

export default function EditClientPage() {
  const { id } = useParams();
  const clientId = Number(id);

  return <EditClient clientId={clientId} />;
}
