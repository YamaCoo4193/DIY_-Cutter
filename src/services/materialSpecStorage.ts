import type { MaterialSpec } from '../models/material';

const STORAGE_KEY = 'diy-cutter:material-specs:v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is string => typeof value === 'string';

const createMigratedMaterialSpecId = (baseId: string, label: string): string =>
  `${baseId}::${label.toLowerCase().replace(/[^\w]+/g, '-')}`;

const parseMaterialSpec = (value: unknown): MaterialSpec[] => {
  if (!isRecord(value)) return [];
  if (!isString(value.id) || !isString(value.name) || !isString(value.color)) return [];
  if (typeof value.widthMm !== 'number' || typeof value.thicknessMm !== 'number') return [];
  const { id, name, color, widthMm, thicknessMm } = value;
  const rawAvailableLengths = Array.isArray(value.availableLengths)
    ? value.availableLengths
    : value.stockLength !== undefined
      ? [value.stockLength]
      : [];

  const stockLengths = rawAvailableLengths.flatMap((item) => {
    if (!isRecord(item)) return [];
    if (!isString(item.label) || typeof item.lengthMm !== 'number') return [];
    if (item.lengthMm <= 0) return [];
    return [{ label: item.label, lengthMm: item.lengthMm }];
  });

  if (widthMm <= 0 || thicknessMm <= 0 || stockLengths.length === 0) return [];

  const uniqueLengths = Array.from(
    new Map(stockLengths.map((item) => [`${item.label}:${item.lengthMm}`, item])).values(),
  );

  return uniqueLengths.map((length) => ({
    id:
      uniqueLengths.length === 1
        ? id
        : createMigratedMaterialSpecId(id, length.label),
    name,
    color,
    widthMm,
    thicknessMm,
    stockLength: length,
  }));
};

export class MaterialSpecStorage {
  public loadAll(): MaterialSpec[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((item) => parseMaterialSpec(item));
    } catch {
      return [];
    }
  }

  public saveAll(materialSpecs: readonly MaterialSpec[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materialSpecs));
  }
}
