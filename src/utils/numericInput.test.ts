import { describe, expect, it } from 'vitest';
import { normalizeNumericInput } from './numericInput';

describe('normalizeNumericInput', () => {
  it('converts full-width numbers to half-width', () => {
    expect(normalizeNumericInput('１２３４５')).toBe('12345');
    expect(normalizeNumericInput('３．５')).toBe('3.5');
  });
});
