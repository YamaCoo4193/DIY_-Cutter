import type { MaterialSpec } from '../../models/material';

export type MaterialSpecGroup = {
  readonly name: string;
  readonly specs: readonly MaterialSpec[];
};

export const buildMaterialSpecGroups = (materialSpecs: readonly MaterialSpec[]): readonly MaterialSpecGroup[] =>
  Array.from(
    materialSpecs.reduce((groups, spec) => {
      const current = groups.get(spec.name) ?? [];
      groups.set(spec.name, [...current, spec].sort((a, b) => a.stockLength.lengthMm - b.stockLength.lengthMm));
      return groups;
    }, new Map<string, MaterialSpec[]>()),
  ).map(([name, specs]) => ({ name, specs }));
