import { describe, expect, it } from 'vitest';
import { normalizeIntegerInput, normalizeNumericInput } from './numericInput';

describe('normalizeNumericInput', () => {
  it('converts full-width numbers to half-width', () => {
    expect(normalizeNumericInput('１２３４５')).toBe('12345');
    expect(normalizeNumericInput('３．５')).toBe('3.5');
  });
});

describe('normalizeIntegerInput', () => {
  it('keeps only digits for integer fields', () => {
    expect(normalizeIntegerInput('１２a3-b')).toBe('123');
    expect(normalizeIntegerInput('1,200mm')).toBe('1200');
  });
});
