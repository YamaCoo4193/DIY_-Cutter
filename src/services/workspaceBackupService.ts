import { buildDefaultStockSelection, createDraftRequirement, restoreWorkspaceSnapshot } from '../domain/services/materialEstimateViewService';
import type { MaterialSpec } from '../models/material';
import type { MaterialEstimateSnapshot } from '../models/materialEstimateSnapshot';

type WorkspaceBackup = {
  readonly version: 1;
  readonly exportedAt: string;
  readonly materialSpecs: readonly MaterialSpec[];
  readonly savedSnapshots: readonly MaterialEstimateSnapshot[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

const parseMaterialSpec = (value: unknown): MaterialSpec | null => {
  if (!isRecord(value)) return null;
  if (!isString(value.id) || !isString(value.name) || !isString(value.color)) return null;
  if (typeof value.widthMm !== 'number' || typeof value.thicknessMm !== 'number') return null;
  if (!isRecord(value.stockLength)) return null;
  if (!isString(value.stockLength.label) || typeof value.stockLength.lengthMm !== 'number') return null;
  if (value.widthMm <= 0 || value.thicknessMm <= 0 || value.stockLength.lengthMm <= 0) return null;

  return {
    id: value.id,
    name: value.name,
    color: value.color,
    widthMm: value.widthMm,
    thicknessMm: value.thicknessMm,
    stockLength: {
      label: value.stockLength.label,
      lengthMm: value.stockLength.lengthMm,
    },
  };
};

const parseRequirement = (value: unknown): MaterialEstimateSnapshot['requirements'][number] | null => {
  if (!isRecord(value)) return null;
  if (!isString(value.id) || !isString(value.lengthMmInput) || !isString(value.quantityInput)) return null;
  if (!(value.materialType === '' || isString(value.materialType))) return null;

  return {
    id: value.id,
    materialType: value.materialType,
    lengthMmInput: value.lengthMmInput,
    quantityInput: value.quantityInput,
  };
};

const parseStockSelection = (value: unknown): MaterialEstimateSnapshot['stockSelection'] => {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<Record<string, readonly string[]>>((selection, [key, labels]) => {
    if (!Array.isArray(labels)) return selection;
    return {
      ...selection,
      [key]: labels.filter((label): label is string => isString(label)),
    };
  }, {});
};

const parseSnapshot = (
  value: unknown,
  materialSpecs: readonly MaterialSpec[],
  createId: () => string,
): MaterialEstimateSnapshot | null => {
  if (!isRecord(value)) return null;
  if (!isString(value.id) || !isString(value.name) || !isString(value.savedAt) || typeof value.kerfMm !== 'number') {
    return null;
  }

  const requirements = Array.isArray(value.requirements)
    ? value.requirements.map(parseRequirement).filter((item): item is NonNullable<typeof item> => item !== null)
    : [];
  const restored = restoreWorkspaceSnapshot(
    {
      kerfMm: value.kerfMm,
      requirements,
      stockSelection: parseStockSelection(value.stockSelection),
    },
    createId,
    materialSpecs,
  );

  return {
    id: value.id,
    name: value.name,
    savedAt: value.savedAt,
    kerfMm: restored.kerfMm,
    requirements: restored.requirements,
    stockSelection: restored.stockSelection,
  };
};

export const createWorkspaceBackupJson = (
  materialSpecs: readonly MaterialSpec[],
  savedSnapshots: readonly MaterialEstimateSnapshot[],
): string =>
  JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      materialSpecs,
      savedSnapshots,
    } satisfies WorkspaceBackup,
    null,
    2,
  );

export const parseWorkspaceBackupJson = (
  raw: string,
  createId: () => string,
): {
  readonly materialSpecs: readonly MaterialSpec[];
  readonly savedSnapshots: readonly MaterialEstimateSnapshot[];
  readonly initialStockSelection: Readonly<Record<string, readonly string[]>>;
  readonly initialRequirements: readonly ReturnType<typeof createDraftRequirement>[];
} | null => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.version !== 1) return null;

    const materialSpecs = Array.isArray(parsed.materialSpecs)
      ? parsed.materialSpecs.map(parseMaterialSpec).filter((item): item is MaterialSpec => item !== null)
      : [];
    const savedSnapshots = Array.isArray(parsed.savedSnapshots)
      ? parsed.savedSnapshots
          .map((snapshot) => parseSnapshot(snapshot, materialSpecs, createId))
          .filter((item): item is MaterialEstimateSnapshot => item !== null)
      : [];

    return {
      materialSpecs,
      savedSnapshots,
      initialStockSelection: buildDefaultStockSelection(materialSpecs),
      initialRequirements: [createDraftRequirement(createId)],
    };
  } catch {
    return null;
  }
};
