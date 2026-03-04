import materialSpecsData from '../../data/materialSpecs.json';
import type { MaterialSpec, MaterialTypeId } from '../../models/material';

export const DEFAULT_KERF_MM = 3;

const isMaterialSpec = (value: unknown): value is MaterialSpec => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.widthMm === 'number' &&
    typeof record.thicknessMm === 'number' &&
    typeof record.color === 'string' &&
    typeof record.stockLength === 'object' &&
    record.stockLength !== null &&
    typeof (record.stockLength as Record<string, unknown>).label === 'string' &&
    typeof (record.stockLength as Record<string, unknown>).lengthMm === 'number'
  );
};

export const INITIAL_MATERIAL_SPECS: readonly MaterialSpec[] = Array.isArray(materialSpecsData)
  ? materialSpecsData.filter(isMaterialSpec)
  : [];

export const createMaterialSpecMap = (
  materialSpecs: readonly MaterialSpec[],
): ReadonlyMap<MaterialTypeId, MaterialSpec> => new Map(materialSpecs.map((spec) => [spec.id, spec]));
