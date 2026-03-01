import type { MaterialSpec, StockLengthLabel } from './material';

export type CutPiece = {
  readonly boardId: string;
  readonly lengthMm: number;
  readonly processOrder?: number;
};

export type CutPlan = {
  readonly materialSpec: MaterialSpec;
  readonly stockLabel: StockLengthLabel;
  readonly stockLengthMm: number;
  readonly usedLengthMm: number;
  readonly wasteMm: number;
  readonly cuts: readonly CutPiece[];
};

export type MaterialSummary = {
  readonly materialSpec: MaterialSpec;
  readonly totalPieces: number;
  readonly totalLengthMm: number;
};

export type OptimizationResult = {
  readonly summaries: readonly MaterialSummary[];
  readonly cutPlans: readonly CutPlan[];
};
