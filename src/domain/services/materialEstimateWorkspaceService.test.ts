import { describe, expect, it } from 'vitest';
import {
  appendMaterialSpecToWorkspace,
  createEstimateSnapshot,
  removeMaterialSpecFromWorkspace,
} from './materialEstimateWorkspaceService';
import type { MaterialSpec } from '../../models/material';

const SPEC_6F: MaterialSpec = {
  id: 'spec-6f',
  name: '2x4',
  widthMm: 89,
  thicknessMm: 19,
  color: '#123456',
  stockLength: { label: '6f', lengthMm: 1829 },
};

const SPEC_8F: MaterialSpec = {
  id: 'spec-8f',
  name: '2x4',
  widthMm: 89,
  thicknessMm: 19,
  color: '#123456',
  stockLength: { label: '8f', lengthMm: 2438 },
};

describe('materialEstimateWorkspaceService', () => {
  it('adds a spec and enables its stock length by default', () => {
    expect(appendMaterialSpecToWorkspace([SPEC_6F], { 'spec-6f': ['6f'] }, SPEC_8F)).toEqual({
      materialSpecs: [SPEC_6F, SPEC_8F],
      stockSelection: {
        'spec-6f': ['6f'],
        'spec-8f': ['8f'],
      },
    });
  });

  it('removes a spec and clears linked requirements', () => {
    expect(
      removeMaterialSpecFromWorkspace(
        {
          materialSpecs: [SPEC_6F, SPEC_8F],
          stockSelection: {
            'spec-6f': ['6f'],
            'spec-8f': ['8f'],
          },
          requirements: [
            { id: 'row-1', materialType: 'spec-8f', lengthMmInput: '900', quantityInput: '2' },
          ],
          appliedRequirements: [
            { id: 'row-1', materialType: 'spec-8f', lengthMmInput: '900', quantityInput: '2' },
          ],
        },
        'spec-8f',
      ),
    ).toEqual({
      materialSpecs: [SPEC_6F],
      stockSelection: {
        'spec-6f': ['6f'],
      },
      requirements: [
        { id: 'row-1', materialType: '', lengthMmInput: '900', quantityInput: '2' },
      ],
      appliedRequirements: [
        { id: 'row-1', materialType: '', lengthMmInput: '900', quantityInput: '2' },
      ],
    });
  });

  it('creates a snapshot from applied requirements', () => {
    expect(createEstimateSnapshot({
      id: 'snapshot-1',
      saveName: 'テスト保存',
      nowIso: '2026-03-04T10:00:00.000Z',
      kerfMm: 3,
      appliedRequirements: [
        { id: 'row-1', materialType: 'spec-6f', lengthMmInput: '1200', quantityInput: '2' },
      ],
      stockSelection: {
        'spec-6f': ['6f'],
      },
    })).toEqual({
      id: 'snapshot-1',
      name: 'テスト保存',
      savedAt: '2026-03-04T10:00:00.000Z',
      kerfMm: 3,
      requirements: [
        { id: 'row-1', materialType: 'spec-6f', lengthMmInput: '1200', quantityInput: '2' },
      ],
      stockSelection: {
        'spec-6f': ['6f'],
      },
    });
  });
});
