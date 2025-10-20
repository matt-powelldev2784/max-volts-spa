import type { QuoteProduct } from '@/types/dbTypes';

type QuoteSummaryProps = {
  quoteId: number;
  clientId: number;
  quoteProducts: QuoteProduct[];
};

const QuoteSummary = ({ quoteId, clientId, quoteProducts }: QuoteSummaryProps) => {
  console.log('quoteId, clientId, quoteProducts', quoteId, clientId, quoteProducts);

  return <div>Quote Summary Component</div>;
};

export default QuoteSummary;
