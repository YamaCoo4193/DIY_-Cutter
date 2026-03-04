import type { MaterialEstimateSnapshot } from '../../models/materialEstimateSnapshot';
import type { MaterialSpec, MaterialTypeId, StockLengthLabel } from '../../models/material';
import type { DraftRequirement } from './materialEstimateViewService';

export type WorkspaceCollections = {
  readonly materialSpecs: readonly MaterialSpec[];
  readonly stockSelection: Readonly<Record<MaterialTypeId, readonly StockLengthLabel[]>>;
  readonly requirements: readonly DraftRequirement[];
  readonly appliedRequirements: readonly DraftRequirement[];
};

export const appendMaterialSpecToWorkspace = (
  materialSpecs: readonly MaterialSpec[],
  stockSelection: Readonly<Record<MaterialTypeId, readonly StockLengthLabel[]>>,
  nextSpec: MaterialSpec,
): Pick<WorkspaceCollections, 'materialSpecs' | 'stockSelection'> => ({
  materialSpecs: [...materialSpecs, nextSpec],
  stockSelection: {
    ...stockSelection,
    [nextSpec.id]: [nextSpec.stockLength.label],
  },
});

export const removeMaterialSpecFromWorkspace = (
  collections: WorkspaceCollections,
  materialSpecId: MaterialTypeId,
): WorkspaceCollections => {
  const materialSpecs = collections.materialSpecs.filter((spec) => spec.id !== materialSpecId);
  const stockSelection = { ...collections.stockSelection };
  delete stockSelection[materialSpecId];

  const clearDeletedMaterial = (row: DraftRequirement): DraftRequirement =>
    row.materialType === materialSpecId ? { ...row, materialType: '' } : row;

  return {
    materialSpecs,
    stockSelection,
    requirements: collections.requirements.map(clearDeletedMaterial),
    appliedRequirements: collections.appliedRequirements.map(clearDeletedMaterial),
  };
};

export const createEstimateSnapshot = ({
  id,
  saveName,
  nowIso,
  kerfMm,
  appliedRequirements,
  stockSelection,
}: {
  readonly id: string;
  readonly saveName: string;
  readonly nowIso: string;
  readonly kerfMm: number;
  readonly appliedRequirements: readonly DraftRequirement[];
  readonly stockSelection: Readonly<Record<MaterialTypeId, readonly StockLengthLabel[]>>;
}): MaterialEstimateSnapshot => ({
  id,
  name: saveName.trim().length > 0 ? saveName.trim() : `保存 ${new Date(nowIso).toLocaleString('ja-JP')}`,
  savedAt: nowIso,
  kerfMm,
  requirements: appliedRequirements,
  stockSelection,
});
