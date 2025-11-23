import type { QuoteProductInsert } from '@/types/dbTypes';

type GetTotalValueProps = {
  quantity: number;
  value: number;
  markup: number;
  vat_rate: number;
};

export const getTotalProductValue = ({ quantity, value, markup, vat_rate }: GetTotalValueProps) => {
  return quantity * value * (1 + markup / 100) * (1 + vat_rate / 100);
};

export const getTotalProductVat = ({ quantity, value, markup, vat_rate }: GetTotalValueProps) => {
  const totalExclVat = quantity * value * (1 + markup / 100);
  return totalExclVat * (vat_rate / 100);
};

export const getQuoteTotalValue = (quoteProducts: QuoteProductInsert[]) => {
  return quoteProducts.reduce((acc, curr) => acc + (curr.total_value || 0), 0);
};

export const getQuoteTotalVat = (quoteProducts: QuoteProductInsert[]) => {
  return quoteProducts.reduce((acc, curr) => acc + (curr.total_vat || 0), 0);
};
