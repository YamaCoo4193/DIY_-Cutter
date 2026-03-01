import type {
  MaterialEstimateSnapshot,
  PersistedMaterialEstimateSnapshot,
} from '../models/materialEstimateSnapshot';

const STORAGE_VERSION = 1;
const STORAGE_KEY = 'diy-cutter:material-estimates:v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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
        const snapshot = entry.snapshot;
        if (!isRecord(snapshot)) return [];
        return [snapshot as MaterialEstimateSnapshot];
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
