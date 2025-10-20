import type { QuoteProduct } from '@/types/dbTypes';

type QuoteSummaryProps = {
  quoteId: number;
  clientId: number;
  quoteProducts: QuoteProduct[];
};

const QuoteSummary = ({ quoteId, clientId, quoteProducts }: QuoteSummaryProps) => {
  console.log('quoteId, clientId, quoteProducts', quoteId, clientId, quoteProducts);

  return <div className="w-full text-center p-2">Quote Summary Component</div>;
};

export default QuoteSummary;
