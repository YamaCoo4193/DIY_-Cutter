const FULLWIDTH_NUMBER_MAP: Readonly<Record<string, string>> = {
  '０': '0',
  '１': '1',
  '２': '2',
  '３': '3',
  '４': '4',
  '５': '5',
  '６': '6',
  '７': '7',
  '８': '8',
  '９': '9',
  '．': '.',
  '－': '-',
  '，': ',',
};

export const normalizeNumericInput = (value: string): string =>
  Array.from(value).map((char) => FULLWIDTH_NUMBER_MAP[char] ?? char).join('');
