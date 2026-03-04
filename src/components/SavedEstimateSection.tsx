import type { MaterialEstimateSnapshot } from '../models/materialEstimateSnapshot';

type Props = {
  readonly savedSnapshots: readonly MaterialEstimateSnapshot[];
  readonly onLoad: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly onExport: () => void;
  readonly onImport: () => void;
  readonly backupMessage: string;
};

export const SavedEstimateSection = ({
  savedSnapshots,
  onLoad,
  onDelete,
  onExport,
  onImport,
  backupMessage,
}: Props): JSX.Element => (
  <>
    <section className="panel backup-panel">
      <h2>保存データ管理</h2>
      <p className="storage-note">
        保存データはこの端末のブラウザ内だけに保持されます。別端末へ移す場合はバックアップ JSON を保存してください。
      </p>
      <div className="inline-group">
        <button type="button" onClick={onExport}>
          バックアップを出力
        </button>
        <button type="button" onClick={onImport}>
          バックアップを読込
        </button>
      </div>
      {backupMessage.length > 0 && <p className="storage-note">{backupMessage}</p>}
    </section>
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
  </>
);
