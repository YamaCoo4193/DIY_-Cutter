import type { CutPiece, CutPlan, MaterialSummary } from '../../models/cutPlan';
import type { MaterialRequirement } from '../../models/materialRequirement';
import type { MaterialSpec, MaterialTypeId, StockLengthLabel } from '../../models/material';
import { MATERIAL_SPEC_MAP } from '../constants/materialSpecs';

type Bin = {
  readonly stockLabel: StockLengthLabel;
  readonly stockLengthMm: number;
  pieces: CutPiece[];
  usedLengthMm: number;
};

export type MaterialEstimationResult = {
  readonly summaries: readonly MaterialSummary[];
  readonly cutPlans: readonly CutPlan[];
};

export type StockSelection = Readonly<Record<MaterialTypeId, readonly StockLengthLabel[]>>;

const byLengthDesc = (a: CutPiece, b: CutPiece): number => b.lengthMm - a.lengthMm;
const byStockLengthAsc = <T extends { lengthMm: number }>(a: T, b: T): number => a.lengthMm - b.lengthMm;

export class MaterialEstimationService {
  public estimate(requirements: readonly MaterialRequirement[], kerfMm: number, stockSelection?: StockSelection): MaterialEstimationResult {
    const safeKerfMm = Number.isFinite(kerfMm) ? Math.max(0, kerfMm) : 0;
    const normalized = requirements.filter((item) => item.lengthMm > 0 && item.quantity > 0);
    const summaries = this.buildSummaries(normalized);
    const cutPlans = summaries.flatMap((summary) =>
      this.optimizeForSpec(
        summary.materialSpec,
        normalized.filter((item) => item.materialType === summary.materialSpec.id),
        safeKerfMm,
        stockSelection?.[summary.materialSpec.id],
      ),
    );
    return { summaries, cutPlans };
  }

  private buildSummaries(requirements: readonly MaterialRequirement[]): MaterialSummary[] {
    const grouped = new Map<MaterialTypeId, { totalPieces: number; totalLengthMm: number }>();
    requirements.forEach((item) => {
      const current = grouped.get(item.materialType) ?? { totalPieces: 0, totalLengthMm: 0 };
      grouped.set(item.materialType, {
        totalPieces: current.totalPieces + item.quantity,
        totalLengthMm: current.totalLengthMm + item.lengthMm * item.quantity,
      });
    });

    return Array.from(grouped.entries()).flatMap(([materialType, total]) => {
      const spec = MATERIAL_SPEC_MAP.get(materialType);
      if (!spec) return [];
      return [{ materialSpec: spec, totalPieces: total.totalPieces, totalLengthMm: total.totalLengthMm }];
    });
  }

  private optimizeForSpec(
    spec: MaterialSpec,
    requirements: readonly MaterialRequirement[],
    kerfMm: number,
    selectedLabels?: readonly StockLengthLabel[],
  ): CutPlan[] {
    const pieces = requirements
      .flatMap((item) =>
        Array.from({ length: item.quantity }, (_unused, index) => ({
          boardId: `${item.id}-${index + 1}`,
          lengthMm: item.lengthMm,
        })),
      )
      .sort(byLengthDesc);

    const allowedStocks = spec.availableLengths
      .filter((stock) => selectedLabels === undefined || selectedLabels.includes(stock.label))
      .sort(byStockLengthAsc);

    if (allowedStocks.length === 0) return [];

    const plans: CutPlan[][] = [];

    // まずは最も素直な混在 best-fit を候補に入れる。
    const greedyMixedPlan = this.buildPlanByBestFitMixed(spec, pieces, kerfMm, allowedStocks);
    if (greedyMixedPlan.length > 0) plans.push(greedyMixedPlan);

    // 単一規格だけで切った方が端材が減る場合があるので、各規格固定も比較する。
    allowedStocks.forEach((stock) => {
      const single = this.buildPlanByBestFitMixed(spec, pieces, kerfMm, [stock]);
      if (single.length > 0) plans.push(single);
    });

    // 拡張時の計算量を抑えるため、順列総当たりではなく代表的な投入順だけ比較する。
    this.buildCandidateOrders(allowedStocks).forEach((order) => {
      const plan = this.buildPlanByCreationOrder(spec, pieces, kerfMm, order);
      if (plan.length > 0) plans.push(plan);
    });

    if (plans.length === 0) return [];

    plans.sort((a, b) => {
      const wasteA = a.reduce((sum, item) => sum + item.wasteMm, 0);
      const wasteB = b.reduce((sum, item) => sum + item.wasteMm, 0);
      if (wasteA !== wasteB) return wasteA - wasteB;
      return a.length - b.length;
    });

    return plans[0]!;
  }

  private buildCandidateOrders(
    allowedStocks: readonly { label: StockLengthLabel; lengthMm: number }[],
  ): readonly (readonly { label: StockLengthLabel; lengthMm: number }[])[] {
    if (allowedStocks.length <= 1) return [allowedStocks];

    const orders = [
      [...allowedStocks].sort(byStockLengthAsc),
      [...allowedStocks].sort((a, b) => b.lengthMm - a.lengthMm),
    ];

    if (allowedStocks.length > 2) {
      const middleFirst = [...allowedStocks].sort((a, b) => a.lengthMm - b.lengthMm);
      const pivot = Math.floor(middleFirst.length / 2);
      orders.push([...middleFirst.slice(pivot), ...middleFirst.slice(0, pivot)]);
    }

    const uniqueOrders = new Map<string, readonly { label: StockLengthLabel; lengthMm: number }[]>();
    orders.forEach((order) => {
      uniqueOrders.set(order.map((item) => item.label).join(','), order);
    });
    return Array.from(uniqueOrders.values());
  }

  private buildPlanByBestFitMixed(
    spec: MaterialSpec,
    pieces: readonly CutPiece[],
    kerfMm: number,
    allowedStocks: readonly { label: StockLengthLabel; lengthMm: number }[],
  ): CutPlan[] {
    const bins: Bin[] = [];
    let processOrder = 1;

    for (const piece of pieces) {
      // 既存の母材に入るなら、追加後の端材が最も少ない母材へ詰める。
      const fittingBins = bins
        .map((bin) => {
          const kerf = bin.pieces.length > 0 ? kerfMm : 0;
          const nextUsed = bin.usedLengthMm + kerf + piece.lengthMm;
          if (nextUsed > bin.stockLengthMm) return null;
          return { bin, nextWaste: bin.stockLengthMm - nextUsed };
        })
        .filter((item): item is { bin: Bin; nextWaste: number } => item !== null)
        .sort((a, b) => a.nextWaste - b.nextWaste);

      const existing = fittingBins[0]?.bin;
      if (existing) {
        existing.usedLengthMm += piece.lengthMm + (existing.pieces.length > 0 ? kerfMm : 0);
        existing.pieces.push({ ...piece, processOrder });
        processOrder += 1;
        continue;
      }

      // 新しい母材を開く場合は、その部材単体で見た端材が最少の規格を選ぶ。
      const stock = allowedStocks
        .filter((candidate) => piece.lengthMm <= candidate.lengthMm)
        .sort((a, b) => {
          const wasteA = a.lengthMm - piece.lengthMm;
          const wasteB = b.lengthMm - piece.lengthMm;
          if (wasteA !== wasteB) return wasteA - wasteB;
          return a.lengthMm - b.lengthMm;
        })[0];

      if (!stock) return [];

      bins.push({
        stockLabel: stock.label,
        stockLengthMm: stock.lengthMm,
        pieces: [{ ...piece, processOrder }],
        usedLengthMm: piece.lengthMm,
      });
      processOrder += 1;
    }

    return bins.map((bin) => ({
      materialSpec: spec,
      stockLabel: bin.stockLabel,
      stockLengthMm: bin.stockLengthMm,
      usedLengthMm: bin.usedLengthMm,
      wasteMm: Math.max(0, bin.stockLengthMm - bin.usedLengthMm),
      cuts: bin.pieces,
    }));
  }

  private buildPlanByCreationOrder(
    spec: MaterialSpec,
    pieces: readonly CutPiece[],
    kerfMm: number,
    stockOrder: readonly { label: StockLengthLabel; lengthMm: number }[],
  ): CutPlan[] {
    const bins: Bin[] = [];
    let processOrder = 1;

    for (const piece of pieces) {
      // 生成済みの母材へ入る場合は、まず既存母材を優先する。
      const fittingBins = bins
        .map((bin) => {
          const kerf = bin.pieces.length > 0 ? kerfMm : 0;
          const nextUsed = bin.usedLengthMm + kerf + piece.lengthMm;
          if (nextUsed > bin.stockLengthMm) return null;
          return { bin, nextWaste: bin.stockLengthMm - nextUsed };
        })
        .filter((item): item is { bin: Bin; nextWaste: number } => item !== null)
        .sort((a, b) => a.nextWaste - b.nextWaste);

      const existing = fittingBins[0]?.bin;
      if (existing) {
        existing.usedLengthMm += piece.lengthMm + (existing.pieces.length > 0 ? kerfMm : 0);
        existing.pieces.push({ ...piece, processOrder });
        processOrder += 1;
        continue;
      }

      const stock = stockOrder.find((candidate) => piece.lengthMm <= candidate.lengthMm);
      if (!stock) return [];

      bins.push({
        stockLabel: stock.label,
        stockLengthMm: stock.lengthMm,
        pieces: [{ ...piece, processOrder }],
        usedLengthMm: piece.lengthMm,
      });
      processOrder += 1;
    }

    return bins.map((bin) => ({
      materialSpec: spec,
      stockLabel: bin.stockLabel,
      stockLengthMm: bin.stockLengthMm,
      usedLengthMm: bin.usedLengthMm,
      wasteMm: Math.max(0, bin.stockLengthMm - bin.usedLengthMm),
      cuts: bin.pieces,
    }));
  }
}
