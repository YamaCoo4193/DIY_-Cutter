import { describe, expect, it } from 'vitest';
import { DEFAULT_KERF_MM } from '../constants/materialSpecs';
import { restoreWorkspaceSnapshot } from './materialEstimateViewService';

describe('restoreWorkspaceSnapshot', () => {
  it('merges partial stock selections with defaults and keeps an empty requirement list usable', () => {
    let sequence = 0;
    const restored = restoreWorkspaceSnapshot(
      {
        kerfMm: Number.NaN,
        requirements: [],
        stockSelection: {
          '1x4': ['8f'],
          '2x4': [],
          cafe: ['4000mm'],
        },
      },
      () => `generated-${++sequence}`,
    );

    expect(restored.kerfMm).toBe(DEFAULT_KERF_MM);
    expect(restored.requirements).toEqual([
      {
        id: 'generated-1',
        materialType: '',
        lengthMmInput: '',
        quantityInput: '',
      },
    ]);
    expect(restored.stockSelection).toEqual({
      '1x4': ['8f'],
      '2x4': [],
      cafe: ['4000mm'],
    });
  });
});
