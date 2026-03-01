import type { MaterialTypeId } from './material';

export type MaterialRequirement = {
  readonly id: string;
  readonly materialType: MaterialTypeId;
  readonly lengthMm: number;
  readonly quantity: number;
};
