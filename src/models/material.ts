export type MaterialTypeId = string;

export type StockLengthLabel = string;

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
  readonly stockLength: StockLengthSpec;
};

export type CustomMaterialSpecDraft = {
  readonly name: string;
  readonly lengthLabel: string;
  readonly lengthMmInput: string;
};
