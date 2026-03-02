import { describe, expect, it } from 'vitest';
import { MaterialEstimationService } from './materialEstimationService';
import type { MaterialRequirement } from '../../models/materialRequirement';

describe('MaterialEstimationService', () => {
  it('returns no cut plan when all stock lengths are deselected', () => {
    const service = new MaterialEstimationService();
    const requirements: readonly MaterialRequirement[] = [
      { id: 'req-1', materialType: '1x4', lengthMm: 900, quantity: 2 },
    ];

    const result = service.estimate(requirements, 3, {
      '1x4': [],
      '2x4': ['6f', '8f', '12f'],
      cafe: ['1000mm', '2000mm', '4000mm'],
    });

    expect(result.summaries).toHaveLength(1);
    expect(result.cutPlans).toHaveLength(0);
  });
});
