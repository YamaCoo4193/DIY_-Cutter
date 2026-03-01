import type { MaterialEstimateSnapshot } from '../models/materialEstimateSnapshot';

type Props = {
  readonly savedSnapshots: readonly MaterialEstimateSnapshot[];
  readonly onLoad: (id: string) => void;
  readonly onDelete: (id: string) => void;
};

export const SavedEstimateSection = ({ savedSnapshots, onLoad, onDelete }: Props): JSX.Element => (
  <section className="panel">
    <h2>保存済み部材結果</h2>
    <div className="cards">
      {savedSnapshots.map((snapshot) => (
        <article key={snapshot.id} className="card">
          <h3>{snapshot.name}</h3>
          <p>{new Date(snapshot.savedAt).toLocaleString('ja-JP')}</p>
          <p>部材入力行: {snapshot.requirements.length}件</p>
          <div className="inline-group">
            <button type="button" onClick={() => onLoad(snapshot.id)}>
              読み込む
            </button>
            <button type="button" onClick={() => onDelete(snapshot.id)}>
              削除
            </button>
          </div>
        </article>
      ))}
      {savedSnapshots.length === 0 && <p>保存済みデータはありません。</p>}
    </div>
  </section>
);
