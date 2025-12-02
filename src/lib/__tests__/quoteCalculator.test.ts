import { describe, expect, test } from 'vitest';
import { getTotalProductValue, getTotalProductVat, getQuoteTotalValue, getQuoteTotalVat } from '../quoteCalculator';
import { defaultRecords } from '@/test/supabaseMock';

describe('quoteCalculator', () => {
  test('calculates total product value correctly', () => {
    const result = getTotalProductValue({
      quantity: 2,
      value: 100,
      markup: 100,
      vat_rate: 20,
    });

    // markup is a percentage, so 100% = 2x value
    // vat is also a percentage, so 20% = 1.2x value
    // quantity * value * markup * vat
    // 2 * 100 * 2 * 1.2 = 480
    expect(result).toBeCloseTo(480);
  });

  test('calculates total product VAT correctly', () => {
    const result = getTotalProductVat({
      quantity: 2,
      value: 100,
      markup: 100,
      vat_rate: 20,
    });

    // markup is a percentage, so 100% = 2x value
    // vat is also a percentage, so 20% = 1.2x value

    // quantity * value * markup * vat
    // totalExclVat = 2 * 100 * 2 = 400

    // totalExclVat * vat
    // VAT = 400 * 0.2 = 80
    expect(result).toBeCloseTo(80);
  });

  test('calculates quote total value from products', () => {
    // see default records mock data 124 + 552 = 676
    const expectedTotal = 676;
    const products = defaultRecords.quote_product;
    expect(getQuoteTotalValue(products)).toBe(expectedTotal);
  });

  test('calculates quote total VAT from products', () => {
    // see default records mock data 24 + 92 = 116
    const expectedTotal = 116;
    const products = defaultRecords.quote_product;
    expect(getQuoteTotalVat(products)).toBe(expectedTotal);
  });
});
