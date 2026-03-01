import { MATERIAL_SPECS } from '../constants/materialSpecs';
import type { MaterialEstimationResult, StockSelection } from './materialEstimationService';
import type { MaterialRequirement } from '../../models/materialRequirement';
import type { DraftRequirementSnapshot } from '../../models/materialEstimateSnapshot';
import type { MaterialTypeId, StockLengthLabel } from '../../models/material';

export type DraftRequirement = DraftRequirementSnapshot;

export type StockAggregate = {
  readonly key: string;
  readonly materialType: MaterialTypeId;
  readonly materialName: string;
  readonly stockLabel: StockLengthLabel;
  readonly stockLengthMm: number;
  readonly count: number;
  readonly wasteCount: number;
  readonly wasteLengthsMm: readonly number[];
  readonly note?: string;
};

export type LengthBreakdown = {
  readonly lengthMm: number;
  readonly quantity: number;
};

export type InputAggregate = {
  readonly materialType: MaterialTypeId;
  readonly materialName: string;
  readonly totalPieces: number;
  readonly byLength: readonly LengthBreakdown[];
};

export const createDraftRequirement = (createId: () => string): DraftRequirement => ({
  id: createId(),
  materialType: '',
  lengthMmInput: '',
  quantityInput: '',
});

const getDefaultLabels = (materialType: MaterialTypeId): readonly StockLengthLabel[] =>
  MATERIAL_SPECS.find((spec) => spec.id === materialType)?.availableLengths.map((length) => length.label) ?? [];

export const buildDefaultStockSelection = (): StockSelection => ({
  '1x4': getDefaultLabels('1x4'),
  '2x4': getDefaultLabels('2x4'),
  cafe: getDefaultLabels('cafe'),
});

export const normalizeRequirements = (requirements: readonly DraftRequirement[]): MaterialRequirement[] =>
  requirements.flatMap((item) => {
    if (!item.materialType) return [];
    const lengthMm = Math.max(0, Number(item.lengthMmInput) || 0);
    const quantity = Math.max(0, Math.floor(Number(item.quantityInput) || 0));
    if (lengthMm <= 0 || quantity <= 0) return [];
    return [{ id: item.id, materialType: item.materialType, lengthMm, quantity }];
  });

export const formatGroupedLengths = (lengths: readonly number[]): string => {
  if (lengths.length === 0) return 'なし';

  const grouped = new Map<number, number>();
  lengths.forEach((length) => {
    grouped.set(length, (grouped.get(length) ?? 0) + 1);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([length, count]) => `${length}mm × ${count}本`)
    .join(', ');
};

export const buildStockAggregates = (
  result: MaterialEstimationResult,
  stockSelection: StockSelection,
  normalizedRequirements: readonly MaterialRequirement[],
): StockAggregate[] => {
  const grouped = new Map<string, StockAggregate>();

  result.cutPlans.forEach((plan) => {
    const key = `${plan.materialSpec.id}-${plan.stockLabel}`;
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, {
        key,
        materialType: plan.materialSpec.id,
        materialName: plan.materialSpec.name,
        stockLabel: plan.stockLabel,
        stockLengthMm: plan.stockLengthMm,
        count: 1,
        wasteCount: plan.wasteMm > 0 ? 1 : 0,
        wasteLengthsMm: plan.wasteMm > 0 ? [Math.round(plan.wasteMm)] : [],
      });
      return;
    }

    grouped.set(key, {
      ...current,
      count: current.count + 1,
      wasteCount: current.wasteCount + (plan.wasteMm > 0 ? 1 : 0),
      wasteLengthsMm: plan.wasteMm > 0 ? [...current.wasteLengthsMm, Math.round(plan.wasteMm)] : current.wasteLengthsMm,
    });
  });

  // 選択規格では切れない長尺部材がある場合も、結果欄が空にならないよう概算行を補う。
  result.summaries.forEach((summary) => {
    const hasAny = Array.from(grouped.values()).some((item) => item.materialType === summary.materialSpec.id);
    if (hasAny) return;

    const selectedLabels = stockSelection[summary.materialSpec.id] ?? [];
    const selectable = summary.materialSpec.availableLengths.filter((stock) => selectedLabels.includes(stock.label));
    if (selectable.length === 0) return;

    const longest = selectable.reduce((acc, current) => (current.lengthMm > acc.lengthMm ? current : acc));
    const maxPieceLength = normalizedRequirements
      .filter((item) => item.materialType === summary.materialSpec.id)
      .reduce((max, item) => Math.max(max, item.lengthMm), 0);
    const count = Math.max(1, Math.ceil(summary.totalLengthMm / longest.lengthMm));

    grouped.set(`${summary.materialSpec.id}-${longest.label}-fallback`, {
      key: `${summary.materialSpec.id}-${longest.label}-fallback`,
      materialType: summary.materialSpec.id,
      materialName: summary.materialSpec.name,
      stockLabel: longest.label,
      stockLengthMm: longest.lengthMm,
      count,
      wasteCount: count,
      wasteLengthsMm: [Math.max(0, count * longest.lengthMm - summary.totalLengthMm)],
      note: maxPieceLength > longest.lengthMm ? '選択規格では収まらない部材あり' : '概算（長尺/接合を含む可能性）',
    });
  });

  return Array.from(grouped.values());
};

export const buildInputAggregates = (normalizedRequirements: readonly MaterialRequirement[]): InputAggregate[] => {
  const grouped = new Map<
    MaterialTypeId,
    { materialName: string; totalPieces: number; lengths: Map<number, number> }
  >();

  normalizedRequirements.forEach((item) => {
    const spec = MATERIAL_SPECS.find((candidate) => candidate.id === item.materialType);
    const materialName = spec?.name ?? item.materialType;
    const current = grouped.get(item.materialType) ?? {
      materialName,
      totalPieces: 0,
      lengths: new Map<number, number>(),
    };

    const nextLengths = new Map(current.lengths);
    nextLengths.set(item.lengthMm, (nextLengths.get(item.lengthMm) ?? 0) + item.quantity);

    grouped.set(item.materialType, {
      materialName,
      totalPieces: current.totalPieces + item.quantity,
      lengths: nextLengths,
    });
  });

  return Array.from(grouped.entries()).map(([materialType, value]) => ({
    materialType,
    materialName: value.materialName,
    totalPieces: value.totalPieces,
    byLength: Array.from(value.lengths.entries())
      .map(([lengthMm, quantity]) => ({ lengthMm, quantity }))
      .sort((a, b) => a.lengthMm - b.lengthMm),
  }));
};

export const buildStockByMaterial = (
  stockAggregates: readonly StockAggregate[],
): ReadonlyMap<MaterialTypeId, readonly StockAggregate[]> => {
  const grouped = new Map<MaterialTypeId, readonly StockAggregate[]>();
  stockAggregates.forEach((item) => {
    const current = grouped.get(item.materialType) ?? [];
    grouped.set(item.materialType, [...current, item]);
  });
  return grouped;
};
