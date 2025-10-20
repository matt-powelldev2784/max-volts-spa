type QuoteSummaryProps = {
  quoteId: number;
  clientId: number;
};

const QuoteSummary = ({ quoteId, clientId }: QuoteSummaryProps) => {
  console.log('quoteId, clientId, quoteProducts', quoteId, clientId);

  return <div className="w-full text-center p-2">Quote Summary Component</div>;
};

export default QuoteSummary;
