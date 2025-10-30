type GetTotalValueProps = {
  quantity: number;
  value: number;
  markup: number;
  vat_rate: number;
};

export const getTotalValue = ({ quantity, value, markup, vat_rate }: GetTotalValueProps) => {
  return quantity * value * (markup / 100) * (1 + vat_rate / 100);
};

export const getTotalVat = ({ quantity, value, markup, vat_rate }: GetTotalValueProps) => {
  const totalExclVat = quantity * value * (markup / 100);
  return totalExclVat * (vat_rate / 100);
};



