import { AlertCircle, FilePlus, FileSpreadsheet, Loader2 } from 'lucide-react';
import { convertQuoteToInvoice } from '../convertQuoteToInvoice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { DropdownMenuItem } from '@/ui/dropdown-menu';

type CreateInvoiceProps = {
  quoteId: number;
  invoiceId: number | null;
  clientId: number;
};

const CreateInvoice = ({ quoteId, invoiceId, clientId }: CreateInvoiceProps) => {
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

  if (invoiceId !== null)
    return (
      <DropdownMenuItem
        data-testid="edit-quote-button"
        className="flex items-center gap-5 px-4 py-2"
        onClick={() => navigate(`/edit/invoice?invoiceId=${invoiceId}&clientId=${clientId}`)}
      >
        <FileSpreadsheet className="size-6 text-mv-orange" />
        <span className="text-xl mr-2">Edit Invoice</span>
      </DropdownMenuItem>
    );

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
      className="flex items-center gap-5 px-4 py-2 hover:bg-gray-100 rounded w-full"
      onClick={() => onSubmit(quoteId)}
    >
      <FilePlus className="size-6 text-mv-orange" />
      <span className="text-xl mr-2">Create Invoice</span>
    </button>
  );
};

export default CreateInvoice;
