import { useMemo, useState } from 'react';
import { MaterialEstimationService } from '../domain/services/materialEstimationService';
import {
  buildDefaultStockSelection,
  buildInputAggregates,
  buildStockAggregates,
  buildStockByMaterial,
  createDraftRequirement,
  normalizeRequirements,
  type DraftRequirement,
} from '../domain/services/materialEstimateViewService';
import type { MaterialEstimateSnapshot } from '../models/materialEstimateSnapshot';
import { MaterialEstimateStorage } from '../services/materialEstimateStorage';
import { createId } from '../utils/id';
import type { MaterialTypeId, StockLengthLabel } from '../models/material';

export const useMaterialEstimateWorkspace = () => {
  const storage = useMemo(() => new MaterialEstimateStorage(), []);
  const estimator = useMemo(() => new MaterialEstimationService(), []);

  const [kerfMm, setKerfMm] = useState(3);
  const [saveName, setSaveName] = useState('');
  const [requirements, setRequirements] = useState<readonly DraftRequirement[]>([createDraftRequirement(createId)]);
  const [stockSelection, setStockSelection] = useState(() => buildDefaultStockSelection());
  const [savedSnapshots, setSavedSnapshots] = useState<readonly MaterialEstimateSnapshot[]>(() => storage.loadAll());

  const normalizedRequirements = useMemo(() => normalizeRequirements(requirements), [requirements]);
  const result = useMemo(
    () => estimator.estimate(normalizedRequirements, kerfMm, stockSelection),
    [estimator, normalizedRequirements, kerfMm, stockSelection],
  );

  const stockAggregates = useMemo(
    () => buildStockAggregates(result, stockSelection, normalizedRequirements),
    [result, stockSelection, normalizedRequirements],
  );
  const inputAggregates = useMemo(() => buildInputAggregates(normalizedRequirements), [normalizedRequirements]);
  const stockByMaterial = useMemo(() => buildStockByMaterial(stockAggregates), [stockAggregates]);

  const addRequirement = (): void => {
    setRequirements((prev) => [...prev, createDraftRequirement(createId)]);
  };

  // 入力行の更新方法を呼び出し側に渡すことで、ページ側の分岐を減らす。
  const updateRequirement = (id: string, updater: (current: DraftRequirement) => DraftRequirement): void => {
    setRequirements((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  };

  const removeRequirement = (id: string): void => {
    setRequirements((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const toggleStockSelection = (materialType: MaterialTypeId, label: StockLengthLabel): void => {
    setStockSelection((prev) => {
      const current = prev[materialType] ?? [];
      const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
      return { ...prev, [materialType]: next };
    });
  };

  const saveCurrent = (): void => {
    const trimmedName = saveName.trim();
    const snapshot: MaterialEstimateSnapshot = {
      id: createId(),
      name: trimmedName.length > 0 ? trimmedName : `保存 ${new Date().toLocaleString('ja-JP')}`,
      savedAt: new Date().toISOString(),
      kerfMm,
      requirements,
      stockSelection,
    };
    const next = [snapshot, ...savedSnapshots];
    setSavedSnapshots(next);
    storage.saveAll(next);
    setSaveName('');
  };

  const loadSnapshot = (id: string): void => {
    const target = savedSnapshots.find((snapshot) => snapshot.id === id);
    if (!target) return;
    setKerfMm(target.kerfMm);
    setRequirements(target.requirements.length > 0 ? target.requirements : [createDraftRequirement(createId)]);
    setStockSelection(target.stockSelection);
  };

  const deleteSnapshot = (id: string): void => {
    const next = savedSnapshots.filter((snapshot) => snapshot.id !== id);
    setSavedSnapshots(next);
    storage.saveAll(next);
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
    stockSelection,
    toggleStockSelection,
    savedSnapshots,
    saveCurrent,
    loadSnapshot,
    deleteSnapshot,
    result,
    stockAggregates,
    inputAggregates,
    stockByMaterial,
  };
};
