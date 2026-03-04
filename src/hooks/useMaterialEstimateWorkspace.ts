import { useMemo, useState } from 'react';
import { DEFAULT_KERF_MM, INITIAL_MATERIAL_SPECS } from '../domain/constants/materialSpecs';
import { MaterialEstimationService } from '../domain/services/materialEstimationService';
import {
  buildDefaultStockSelection,
  buildInputAggregates,
  restoreWorkspaceSnapshot,
  buildStockAggregates,
  buildStockByMaterial,
  createDraftRequirement,
  normalizeRequirements,
  type DraftRequirement,
} from '../domain/services/materialEstimateViewService';
import {
  appendMaterialSpecToWorkspace,
  createEstimateSnapshot,
  removeMaterialSpecFromWorkspace,
} from '../domain/services/materialEstimateWorkspaceService';
import { createCustomMaterialSpec, isDuplicateMaterialSpec } from '../domain/services/materialSpecService';
import type { MaterialEstimateSnapshot } from '../models/materialEstimateSnapshot';
import { MaterialEstimateStorage } from '../services/materialEstimateStorage';
import { MaterialSpecStorage } from '../services/materialSpecStorage';
import { createWorkspaceBackupJson, parseWorkspaceBackupJson } from '../services/workspaceBackupService';
import { createId } from '../utils/id';
import type { CustomMaterialSpecDraft, MaterialSpec, MaterialTypeId, StockLengthLabel } from '../models/material';

export const useMaterialEstimateWorkspace = () => {
  const storage = useMemo(() => new MaterialEstimateStorage(), []);
  const materialSpecStorage = useMemo(() => new MaterialSpecStorage(), []);
  const estimator = useMemo(() => new MaterialEstimationService(), []);
  const initialRequirement = useMemo(() => createDraftRequirement(createId), []);
  const initialMaterialSpecs = useMemo(
    () => [...INITIAL_MATERIAL_SPECS, ...materialSpecStorage.loadAll()],
    [materialSpecStorage],
  );

  const [kerfMm, setKerfMm] = useState(DEFAULT_KERF_MM);
  const [saveName, setSaveName] = useState('');
  const [backupMessage, setBackupMessage] = useState('');
  const [requirements, setRequirements] = useState<readonly DraftRequirement[]>([initialRequirement]);
  const [appliedRequirements, setAppliedRequirements] = useState<readonly DraftRequirement[]>([initialRequirement]);
  const [materialSpecs, setMaterialSpecs] = useState<readonly MaterialSpec[]>(initialMaterialSpecs);
  const [stockSelection, setStockSelection] = useState(() => buildDefaultStockSelection(initialMaterialSpecs));
  const [savedSnapshots, setSavedSnapshots] = useState<readonly MaterialEstimateSnapshot[]>(() =>
    storage.loadAll(initialMaterialSpecs),
  );

  const normalizedRequirements = useMemo(() => normalizeRequirements(appliedRequirements), [appliedRequirements]);
  const result = useMemo(
    () => estimator.estimate(normalizedRequirements, kerfMm, materialSpecs, stockSelection),
    [estimator, normalizedRequirements, kerfMm, materialSpecs, stockSelection],
  );

  const stockAggregates = useMemo(
    () => buildStockAggregates(result, stockSelection, normalizedRequirements),
    [result, stockSelection, normalizedRequirements],
  );
  const inputAggregates = useMemo(
    () => buildInputAggregates(normalizedRequirements, materialSpecs),
    [normalizedRequirements, materialSpecs],
  );
  const stockByMaterial = useMemo(() => buildStockByMaterial(stockAggregates), [stockAggregates]);

  const persistMaterialSpecs = (nextMaterialSpecs: readonly MaterialSpec[]): void => {
    materialSpecStorage.saveAll(nextMaterialSpecs.filter((spec) => spec.id.startsWith('custom-')));
  };

  const addRequirement = (): void => {
    setRequirements((prev) => [...prev, createDraftRequirement(createId)]);
  };

  // 入力行の更新方法を呼び出し側に渡すことで、ページ側の分岐を減らす。
  const updateRequirement = (id: string, updater: (current: DraftRequirement) => DraftRequirement): void => {
    setRequirements((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  };

  const removeRequirement = (id: string): void => {
    setRequirements((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.id !== id);
    });
  };

  const applyRequirements = (): void => {
    setAppliedRequirements(
      requirements.length > 0 ? requirements.map((row) => ({ ...row })) : [createDraftRequirement(createId)],
    );
  };

  const toggleStockSelection = (materialType: MaterialTypeId, label: StockLengthLabel): void => {
    setStockSelection((prev) => {
      const current = prev[materialType] ?? [];
      const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
      return { ...prev, [materialType]: next };
    });
  };

  const addMaterialSpec = (draft: CustomMaterialSpecDraft): boolean => {
    if (isDuplicateMaterialSpec(draft, materialSpecs)) return false;

    const nextSpec = createCustomMaterialSpec(draft, createId, materialSpecs.length);
    if (!nextSpec) return false;

    const nextCollections = appendMaterialSpecToWorkspace(materialSpecs, stockSelection, nextSpec);
    setMaterialSpecs(nextCollections.materialSpecs);
    persistMaterialSpecs(nextCollections.materialSpecs);
    setStockSelection(nextCollections.stockSelection);
    return true;
  };

  const deleteMaterialSpec = (materialSpecId: MaterialTypeId): void => {
    const nextCollections = removeMaterialSpecFromWorkspace(
      { materialSpecs, stockSelection, requirements, appliedRequirements },
      materialSpecId,
    );
    setMaterialSpecs(nextCollections.materialSpecs);
    persistMaterialSpecs(nextCollections.materialSpecs);
    setStockSelection(nextCollections.stockSelection);
    setRequirements(nextCollections.requirements);
    setAppliedRequirements(nextCollections.appliedRequirements);
  };

  const saveCurrent = (): void => {
    const snapshot: MaterialEstimateSnapshot = createEstimateSnapshot({
      id: createId(),
      saveName,
      nowIso: new Date().toISOString(),
      kerfMm,
      appliedRequirements,
      stockSelection,
    });
    const next = [snapshot, ...savedSnapshots];
    setSavedSnapshots(next);
    storage.saveAll(next);
    setSaveName('');
  };

  const loadSnapshot = (id: string): void => {
    const target = savedSnapshots.find((snapshot) => snapshot.id === id);
    if (!target) return;
    const restored = restoreWorkspaceSnapshot(target, createId, materialSpecs);
    setKerfMm(restored.kerfMm);
    setRequirements(restored.requirements);
    setAppliedRequirements(restored.requirements);
    setStockSelection(restored.stockSelection);
  };

  const deleteSnapshot = (id: string): void => {
    const next = savedSnapshots.filter((snapshot) => snapshot.id !== id);
    setSavedSnapshots(next);
    storage.saveAll(next);
  };

  const exportBackup = (): { readonly fileName: string; readonly content: string } => ({
    fileName: `diy-cutter-backup-${new Date().toISOString().slice(0, 10)}.json`,
    content: createWorkspaceBackupJson(materialSpecs.filter((spec) => spec.id.startsWith('custom-')), savedSnapshots),
  });

  const importBackup = (raw: string): boolean => {
    const parsed = parseWorkspaceBackupJson(raw, createId);
    if (!parsed) {
      setBackupMessage('バックアップファイルを読み込めませんでした。');
      return false;
    }

    const nextMaterialSpecs = [...INITIAL_MATERIAL_SPECS, ...parsed.materialSpecs];
    setMaterialSpecs(nextMaterialSpecs);
    setStockSelection(buildDefaultStockSelection(nextMaterialSpecs));
    setRequirements(parsed.initialRequirements);
    setAppliedRequirements(parsed.initialRequirements);
    setSavedSnapshots(parsed.savedSnapshots);
    setKerfMm(DEFAULT_KERF_MM);
    setSaveName('');
    persistMaterialSpecs(nextMaterialSpecs);
    storage.saveAll(parsed.savedSnapshots);
    setBackupMessage('バックアップを読み込みました。');
    return true;
  };

  const clearBackupMessage = (): void => {
    setBackupMessage('');
  };

  return {
    kerfMm,
    setKerfMm,
    saveName,
    setSaveName,
    requirements,
    addRequirement,
    updateRequirement,
    removeRequirement,
    applyRequirements,
    stockSelection,
    toggleStockSelection,
    materialSpecs,
    addMaterialSpec,
    deleteMaterialSpec,
    savedSnapshots,
    saveCurrent,
    loadSnapshot,
    deleteSnapshot,
    exportBackup,
    importBackup,
    backupMessage,
    clearBackupMessage,
    result,
    stockAggregates,
    inputAggregates,
    stockByMaterial,
  };
};
