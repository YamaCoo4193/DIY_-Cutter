import type { MaterialTypeId, StockLengthLabel } from './material';

export type DraftRequirementSnapshot = {
  readonly id: string;
  readonly materialType: MaterialTypeId | '';
  readonly lengthMmInput: string;
  readonly quantityInput: string;
};

export type MaterialEstimateSnapshot = {
  readonly id: string;
  readonly name: string;
  readonly savedAt: string;
  readonly kerfMm: number;
  readonly requirements: readonly DraftRequirementSnapshot[];
  readonly stockSelection: Readonly<Record<MaterialTypeId, readonly StockLengthLabel[]>>;
};

export type PersistedMaterialEstimateSnapshot = {
  readonly version: number;
  readonly snapshot: MaterialEstimateSnapshot;
};
