import type {
  DraftRequirementSnapshot,
  MaterialEstimateSnapshot,
  PersistedMaterialEstimateSnapshot,
} from '../models/materialEstimateSnapshot';
import type { MaterialTypeId, StockLengthLabel } from '../models/material';
import { DEFAULT_KERF_MM, MATERIAL_SPECS } from '../domain/constants/materialSpecs';
import { sanitizeStockSelection } from '../domain/services/materialEstimateViewService';

const STORAGE_VERSION = 1;
const STORAGE_KEY = 'diy-cutter:material-estimates:v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const MATERIAL_TYPE_IDS = new Set<MaterialTypeId>(MATERIAL_SPECS.map((spec) => spec.id));
const STOCK_LENGTH_LABELS = new Set<StockLengthLabel>(
  MATERIAL_SPECS.flatMap((spec) => spec.availableLengths.map((length) => length.label)),
);

const isString = (value: unknown): value is string => typeof value === 'string';

const isMaterialTypeId = (value: unknown): value is MaterialTypeId => isString(value) && MATERIAL_TYPE_IDS.has(value as MaterialTypeId);

const isStockLengthLabel = (value: unknown): value is StockLengthLabel =>
  isString(value) && STOCK_LENGTH_LABELS.has(value as StockLengthLabel);

const parseRequirement = (value: unknown): DraftRequirementSnapshot | null => {
  if (!isRecord(value)) return null;
  if (!isString(value.id) || !isString(value.lengthMmInput) || !isString(value.quantityInput)) return null;
  if (!(value.materialType === '' || isMaterialTypeId(value.materialType))) return null;

  return {
    id: value.id,
    materialType: value.materialType,
    lengthMmInput: value.lengthMmInput,
    quantityInput: value.quantityInput,
  };
};

const parseStockSelection = (value: unknown): Partial<Record<MaterialTypeId, readonly StockLengthLabel[]>> => {
  if (!isRecord(value)) return {};

  return MATERIAL_SPECS.reduce<Partial<Record<MaterialTypeId, readonly StockLengthLabel[]>>>((selection, spec) => {
    const labels = value[spec.id];
    if (!Array.isArray(labels)) return selection;
    return {
      ...selection,
      [spec.id]: labels.filter(isStockLengthLabel),
    };
  }, {});
};

const parseSnapshot = (value: unknown): MaterialEstimateSnapshot | null => {
  if (!isRecord(value)) return null;
  if (!isString(value.id) || !isString(value.name) || !isString(value.savedAt)) return null;

  const requirements = Array.isArray(value.requirements) ? value.requirements.map(parseRequirement).filter((item): item is DraftRequirementSnapshot => item !== null) : [];
  const kerfMm = typeof value.kerfMm === 'number' && Number.isFinite(value.kerfMm) ? Math.max(0, value.kerfMm) : DEFAULT_KERF_MM;

  return {
    id: value.id,
    name: value.name,
    savedAt: value.savedAt,
    kerfMm,
    requirements,
    stockSelection: sanitizeStockSelection(parseStockSelection(value.stockSelection)),
  };
};

export class MaterialEstimateStorage {
  public loadAll(): MaterialEstimateSnapshot[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];

      // バージョン不一致や壊れたデータは静かに無視して、UIを壊さない。
      return parsed.flatMap((entry) => {
        if (!isRecord(entry)) return [];
        if (entry.version !== STORAGE_VERSION) return [];
        const snapshot = parseSnapshot(entry.snapshot);
        return snapshot ? [snapshot] : [];
      });
    } catch {
      return [];
    }
  }

  public saveAll(snapshots: readonly MaterialEstimateSnapshot[]): void {
    // 保存形式を固定しておくと、将来のマイグレーション判断がしやすい。
    const payload: PersistedMaterialEstimateSnapshot[] = snapshots.map((snapshot) => ({
      version: STORAGE_VERSION,
      snapshot,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
}
