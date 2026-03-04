import { describe, expect, it } from 'vitest';
import { DEFAULT_KERF_MM } from '../constants/materialSpecs';
import { restoreWorkspaceSnapshot } from './materialEstimateViewService';
import type { MaterialSpec } from '../../models/material';

const TEST_MATERIAL_SPECS: readonly MaterialSpec[] = [
  {
    id: 'custom-1x4',
    name: '1x4',
    widthMm: 89,
    thicknessMm: 19,
    color: '#f28f3b',
    stockLength: { label: '8f', lengthMm: 2438 },
  },
  {
    id: 'custom-2x4',
    name: '2x4',
    widthMm: 89,
    thicknessMm: 38,
    color: '#4d7ea8',
    stockLength: { label: '6f', lengthMm: 1829 },
  },
  {
    id: 'custom-cafe',
    name: 'カフェ板',
    widthMm: 200,
    thicknessMm: 30,
    color: '#8c6a43',
    stockLength: { label: '4000mm', lengthMm: 4000 },
  },
];

describe('restoreWorkspaceSnapshot', () => {
  it('merges partial stock selections with defaults and keeps an empty requirement list usable', () => {
    let sequence = 0;
    const restored = restoreWorkspaceSnapshot(
      {
        kerfMm: Number.NaN,
        requirements: [],
        stockSelection: {
          'custom-1x4': ['8f'],
          'custom-2x4': [],
          'custom-cafe': ['4000mm'],
        },
      },
      () => `generated-${++sequence}`,
      TEST_MATERIAL_SPECS,
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
      'custom-1x4': ['8f'],
      'custom-2x4': [],
      'custom-cafe': ['4000mm'],
    });
  });

  it('clears requirement materialType when the snapshot points to a missing spec', () => {
    const restored = restoreWorkspaceSnapshot(
      {
        kerfMm: 3,
        requirements: [
          {
            id: 'req-1',
            materialType: 'missing-spec',
            lengthMmInput: '900',
            quantityInput: '2',
          },
        ],
        stockSelection: {},
      },
      () => 'generated-1',
      TEST_MATERIAL_SPECS,
    );

    expect(restored.requirements).toEqual([
      {
        id: 'req-1',
        materialType: '',
        lengthMmInput: '900',
        quantityInput: '2',
      },
    ]);
  });
});
