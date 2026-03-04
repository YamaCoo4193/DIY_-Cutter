import { describe, expect, it } from 'vitest';
import { MaterialEstimationService } from './materialEstimationService';
import type { MaterialRequirement } from '../../models/materialRequirement';
import type { MaterialSpec } from '../../models/material';

const TEST_MATERIAL_SPECS: readonly MaterialSpec[] = [
  {
    id: 'custom-1x4',
    name: '1x4',
    widthMm: 89,
    thicknessMm: 19,
    color: '#f28f3b',
    stockLength: { label: '6f', lengthMm: 1829 },
  },
];

describe('MaterialEstimationService', () => {
  it('returns no cut plan when all stock lengths are deselected', () => {
    const service = new MaterialEstimationService();
    const requirements: readonly MaterialRequirement[] = [
      { id: 'req-1', materialType: 'custom-1x4', lengthMm: 900, quantity: 2 },
    ];

    const result = service.estimate(requirements, 3, TEST_MATERIAL_SPECS, {
      'custom-1x4': [],
    });

    expect(result.summaries).toHaveLength(1);
    expect(result.cutPlans).toHaveLength(0);
  });
});
