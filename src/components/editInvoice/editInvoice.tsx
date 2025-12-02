import { useLocation } from 'react-router';

const EditInvoice = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const invoiceId = Number(searchParams.get('invoiceId'));
  return <div>{invoiceId}</div>;
};

export default EditInvoice;
