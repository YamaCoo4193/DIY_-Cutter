import type { InputAggregate, StockAggregate } from '../domain/services/materialEstimateViewService';
import type { MaterialTypeId } from '../models/material';

type Props = {
  readonly inputAggregates: readonly InputAggregate[];
  readonly stockByMaterial: ReadonlyMap<MaterialTypeId, readonly StockAggregate[]>;
};

export const MaterialResultSection = ({ inputAggregates, stockByMaterial }: Props): JSX.Element => (
  <section className="panel">
    <h2>部材結果</h2>
    <div className="cards">
      {inputAggregates.map((summary) => (
        <article key={summary.materialType} className="card">
          <h3>{summary.materialName}</h3>
          {summary.byLength.map((item) => (
            <p key={`${summary.materialType}-${item.lengthMm}`}>
              {item.lengthMm}mm: {item.quantity}本
            </p>
          ))}
          <p>合計本数: {summary.totalPieces}</p>
          {(stockByMaterial.get(summary.materialType) ?? []).map((item) => (
            <p key={`${summary.materialType}-${item.stockLabel}`}>
              必要材料: {item.stockLabel} × {item.count}本
            </p>
          ))}
        </article>
      ))}
      {inputAggregates.length === 0 && <p>入力された部材がありません。</p>}
    </div>
  </section>
);
