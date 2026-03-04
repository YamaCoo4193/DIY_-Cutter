import { describe, expect, it } from 'vitest';
import { createWorkspaceBackupJson, parseWorkspaceBackupJson } from './workspaceBackupService';
import type { MaterialSpec } from '../models/material';
import type { MaterialEstimateSnapshot } from '../models/materialEstimateSnapshot';

const TEST_MATERIAL_SPECS: readonly MaterialSpec[] = [
  {
    id: 'spec-6f',
    name: '2x4',
    widthMm: 89,
    thicknessMm: 19,
    color: '#123456',
    stockLength: { label: '6f', lengthMm: 1829 },
  },
];

const TEST_SNAPSHOTS: readonly MaterialEstimateSnapshot[] = [
  {
    id: 'snapshot-1',
    name: '案1',
    savedAt: '2026-03-04T10:00:00.000Z',
    kerfMm: 3,
    requirements: [
      { id: 'req-1', materialType: 'spec-6f', lengthMmInput: '900', quantityInput: '2' },
    ],
    stockSelection: {
      'spec-6f': ['6f'],
    },
  },
];

describe('workspaceBackupService', () => {
  it('serializes and restores backup data', () => {
    const raw = createWorkspaceBackupJson(TEST_MATERIAL_SPECS, TEST_SNAPSHOTS);
    const parsed = parseWorkspaceBackupJson(raw, () => 'generated-1');

    expect(parsed).toEqual({
      materialSpecs: TEST_MATERIAL_SPECS,
      savedSnapshots: TEST_SNAPSHOTS,
      initialStockSelection: {
        'spec-6f': ['6f'],
      },
      initialRequirements: [
        {
          id: 'generated-1',
          materialType: '',
          lengthMmInput: '',
          quantityInput: '',
        },
      ],
    });
  });

  it('returns null for unsupported backup versions', () => {
    expect(parseWorkspaceBackupJson(JSON.stringify({ version: 2 }), () => 'generated-1')).toBeNull();
  });
});
