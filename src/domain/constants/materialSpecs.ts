import type { MaterialSpec, MaterialTypeId } from '../../models/material';

const FEET_TO_MM = 304.8;
const toMm = (feet: number): number => Math.round(feet * FEET_TO_MM);

export const DEFAULT_KERF_MM = 3;
const BASE_THICKNESS_MM = 19;

export const MATERIAL_SPECS: readonly MaterialSpec[] = [
  {
    id: '1x4',
    name: '1 x 4',
    widthMm: 89,
    thicknessMm: BASE_THICKNESS_MM,
    color: '#f28f3b',
    availableLengths: [
      { label: '6f', lengthMm: toMm(6) },
      { label: '8f', lengthMm: toMm(8) },
      { label: '12f', lengthMm: toMm(12) },
    ],
  },
  {
    id: '2x4',
    name: '2 x 4',
    widthMm: 89,
    thicknessMm: BASE_THICKNESS_MM * 2,
    color: '#4d7ea8',
    availableLengths: [
      { label: '6f', lengthMm: toMm(6) },
      { label: '8f', lengthMm: toMm(8) },
      { label: '12f', lengthMm: toMm(12) },
    ],
  },
  {
    id: 'cafe',
    name: 'カフェ板',
    widthMm: 200,
    thicknessMm: 30,
    color: '#8c6a43',
    availableLengths: [
      { label: '1000mm', lengthMm: 1000 },
      { label: '2000mm', lengthMm: 2000 },
      { label: '4000mm', lengthMm: 4000 },
    ],
  },
];

export const MATERIAL_SPEC_MAP: ReadonlyMap<MaterialTypeId, MaterialSpec> = new Map(
  MATERIAL_SPECS.map((spec) => [spec.id, spec]),
);
