import { describe, expect, it } from 'vitest';
import { isDuplicateMaterialSpec } from './materialSpecService';
import type { MaterialSpec } from '../../models/material';

const TEST_MATERIAL_SPECS: readonly MaterialSpec[] = [
  {
    id: 'custom-2x4-6f',
    name: '2x4',
    widthMm: 89,
    thicknessMm: 19,
    color: '#2f6c5d',
    stockLength: { label: '6f', lengthMm: 1829 },
  },
];

describe('isDuplicateMaterialSpec', () => {
  it('treats the same spec name and length as duplicate', () => {
    expect(
      isDuplicateMaterialSpec(
        {
          name: '2x4',
          lengthLabel: '6f',
          lengthMmInput: '1829',
        },
        TEST_MATERIAL_SPECS,
      ),
    ).toBe(true);
  });

  it('treats full-width and half-width spec names with the same length as duplicate', () => {
    expect(
      isDuplicateMaterialSpec(
        {
          name: '２ｘ４',
          lengthLabel: '6F',
          lengthMmInput: '１８２９',
        },
        TEST_MATERIAL_SPECS,
      ),
    ).toBe(true);
  });

  it('allows registration when the length differs', () => {
    expect(
      isDuplicateMaterialSpec(
        {
          name: '2x4',
          lengthLabel: '8f',
          lengthMmInput: '2438',
        },
        TEST_MATERIAL_SPECS,
      ),
    ).toBe(false);
  });
});
