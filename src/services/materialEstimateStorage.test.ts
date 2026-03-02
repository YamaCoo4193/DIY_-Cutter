import { beforeEach, describe, expect, it } from 'vitest';
import { MaterialEstimateStorage } from './materialEstimateStorage';

class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  public get length(): number {
    return this.store.size;
  }

  public clear(): void {
    this.store.clear();
  }

  public getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  public key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('MaterialEstimateStorage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: new MemoryStorage(),
    });
  });

  it('ignores invalid snapshot fields and sanitizes the rest', () => {
    localStorage.setItem(
      'diy-cutter:material-estimates:v1',
      JSON.stringify([
        {
          version: 1,
          snapshot: {
            id: 'snapshot-1',
            name: 'Saved',
            savedAt: '2026-03-02T00:00:00.000Z',
            kerfMm: 'broken',
            requirements: [
              {
                id: 'req-1',
                materialType: '1x4',
                lengthMmInput: '300',
                quantityInput: '2',
              },
              {
                id: 10,
                materialType: 'invalid',
                lengthMmInput: 100,
                quantityInput: 1,
              },
            ],
            stockSelection: {
              '1x4': ['8f', 'bad-label'],
              cafe: ['4000mm'],
            },
          },
        },
      ]),
    );

    const storage = new MaterialEstimateStorage();

    expect(storage.loadAll()).toEqual([
      {
        id: 'snapshot-1',
        name: 'Saved',
        savedAt: '2026-03-02T00:00:00.000Z',
        kerfMm: 3,
        requirements: [
          {
            id: 'req-1',
            materialType: '1x4',
            lengthMmInput: '300',
            quantityInput: '2',
          },
        ],
        stockSelection: {
          '1x4': ['8f'],
          '2x4': ['6f', '8f', '12f'],
          cafe: ['4000mm'],
        },
      },
    ]);
  });
});
