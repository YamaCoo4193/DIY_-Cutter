import { describe, expect, it } from 'vitest';
import { buildMaterialSpecGroups } from './materialSpecViewService';
import type { MaterialSpec } from '../../models/material';

const TEST_SPECS: readonly MaterialSpec[] = [
  {
    id: 'spec-8f',
    name: '2x4',
    widthMm: 89,
    thicknessMm: 19,
    color: '#123456',
    stockLength: { label: '8f', lengthMm: 2438 },
  },
  {
    id: 'spec-6f',
    name: '2x4',
    widthMm: 89,
    thicknessMm: 19,
    color: '#123456',
    stockLength: { label: '6f', lengthMm: 1829 },
  },
  {
    id: 'spec-board',
    name: 'カフェ板',
    widthMm: 200,
    thicknessMm: 30,
    color: '#654321',
    stockLength: { label: '4000mm', lengthMm: 4000 },
  },
];

describe('buildMaterialSpecGroups', () => {
  it('groups by name and sorts lengths in ascending order', () => {
    expect(buildMaterialSpecGroups(TEST_SPECS)).toEqual([
      {
        name: '2x4',
        specs: [TEST_SPECS[1], TEST_SPECS[0]],
      },
      {
        name: 'カフェ板',
        specs: [TEST_SPECS[2]],
      },
    ]);
  });
});
