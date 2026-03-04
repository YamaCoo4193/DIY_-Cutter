import type { CustomMaterialSpecDraft, MaterialSpec } from '../../models/material';
import { normalizeIntegerInput } from '../../utils/numericInput';

const CUSTOM_COLOR_PALETTE = ['#2f6c5d', '#b55d3d', '#5a6fb2', '#8a5c9e', '#8b6a39'] as const;
const DEFAULT_CUSTOM_WIDTH_MM = 89;
const DEFAULT_CUSTOM_THICKNESS_MM = 19;

export const createEmptyCustomMaterialSpecDraft = (): CustomMaterialSpecDraft => ({
  name: '',
  lengthLabel: '6f',
  lengthMmInput: '1829',
});

const createLengthAwareId = (createId: () => string, label: string): string =>
  `custom-${label.toLowerCase().replace(/[^\w]+/g, '-')}-${createId()}`;

const normalizeMaterialSpecName = (value: string): string =>
  value.normalize('NFKC').replace(/\s+/g, '').toLowerCase();

export const isDuplicateMaterialSpec = (
  draft: CustomMaterialSpecDraft,
  existingSpecs: readonly MaterialSpec[],
): boolean => {
  const normalizedName = normalizeMaterialSpecName(draft.name);
  const lengthMm = Math.floor(Number(normalizeIntegerInput(draft.lengthMmInput)));
  if (!normalizedName || !Number.isFinite(lengthMm) || lengthMm <= 0) return false;

  return existingSpecs.some((spec) => {
    return normalizeMaterialSpecName(spec.name) === normalizedName && spec.stockLength.lengthMm === lengthMm;
  });
};

export const createCustomMaterialSpec = (
  draft: CustomMaterialSpecDraft,
  createId: () => string,
  existingCount: number,
): MaterialSpec | null => {
  const name = draft.name.trim();
  const lengthLabel = draft.lengthLabel.trim();
  const lengthMm = Math.floor(Number(normalizeIntegerInput(draft.lengthMmInput)));
  if (!name || !lengthLabel || !Number.isFinite(lengthMm) || lengthMm <= 0) return null;

  return {
    id: createLengthAwareId(createId, `${name}-${lengthLabel}`),
    name,
    widthMm: DEFAULT_CUSTOM_WIDTH_MM,
    thicknessMm: DEFAULT_CUSTOM_THICKNESS_MM,
    color: CUSTOM_COLOR_PALETTE[existingCount % CUSTOM_COLOR_PALETTE.length]!,
    stockLength: { label: lengthLabel, lengthMm },
  };
};
