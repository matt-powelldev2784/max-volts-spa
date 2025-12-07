import { AlertCircle, FilePlus, Loader2 } from 'lucide-react';
import { convertQuoteToInvoice } from '../convertQuoteToInvoice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

type CreateInvoiceProps = {
  quoteId: number;
};

const CreateInvoice = ({ quoteId }: CreateInvoiceProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: convertQuoteToInvoice,
    onSuccess: ({ invoiceId, clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate(`/edit/invoice?invoiceId=${invoiceId}&clientId=${clientId}`);
    },
  });

  const onSubmit = (quoteId: number) => {
    mutation.mutate(quoteId);
  };

  if (mutation.isError)
    return (
      <div className="flex items-center gap-5 px-4 py-2 w-full bg-red-500 rounded">
        <AlertCircle className="size-6 text-white" />
        <span className="text-xl mr-2 text-white">Invoice Error</span>
      </div>
    );

  if (mutation.isPending)
    return (
      <div className="flex items-center gap-5 px-4 py-2 w-full">
        <Loader2 className="size-6 text-mv-orange animate-spin" />
        <span className="text-xl mr-2">Creating Invoice...</span>
      </div>
    );

  return (
    <button
      data-testid="create-invoice-button"
      className="flex items-center gap-5 px-4 py-2"
      onClick={() => onSubmit(quoteId)}
    >
      <FilePlus className="size-6 text-mv-orange" />
      <span className="text-xl mr-2">Create Invoice</span>
    </button>
  );
};

export default CreateInvoice;
