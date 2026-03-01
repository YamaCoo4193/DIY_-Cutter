import { formatGroupedLengths, type StockAggregate } from '../domain/services/materialEstimateViewService';

type Props = {
  readonly stockAggregates: readonly StockAggregate[];
};

export const MaterialSummarySection = ({ stockAggregates }: Props): JSX.Element => (
  <section className="panel">
    <h2>必要材料</h2>
    <div className="cards">
      {stockAggregates.map((item) => (
        <article key={item.key} className="card">
          <h3>
            {item.materialName} / {item.stockLabel}
          </h3>
          <p>材料: {item.count}本</p>
          <p>長さ: {item.stockLengthMm}mm</p>
          <p>端材本数: {item.wasteCount}本</p>
          <p>端材長さ: {formatGroupedLengths(item.wasteLengthsMm)}</p>
          {item.note && <p>{item.note}</p>}
        </article>
      ))}
      {stockAggregates.length === 0 && <p>入力された部材がありません。</p>}
    </div>
  </section>
);
