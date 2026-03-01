export type MaterialTypeId = '1x4' | '2x4' | 'cafe';

export type StockLengthLabel = '6f' | '8f' | '12f' | '1000mm' | '2000mm' | '4000mm';

export type StockLengthSpec = {
  readonly label: StockLengthLabel;
  readonly lengthMm: number;
};

export type MaterialSpec = {
  readonly id: MaterialTypeId;
  readonly name: string;
  readonly widthMm: number;
  readonly thicknessMm: number;
  readonly color: string;
  readonly availableLengths: readonly StockLengthSpec[];
};
