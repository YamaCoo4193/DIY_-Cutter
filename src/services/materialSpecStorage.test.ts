import { beforeEach, describe, expect, it } from 'vitest';
import { MaterialSpecStorage } from './materialSpecStorage';

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

describe('MaterialSpecStorage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: new MemoryStorage(),
    });
  });

  it('migrates legacy multi-length specs into one spec per length', () => {
    localStorage.setItem(
      'diy-cutter:material-specs:v1',
      JSON.stringify([
        {
          id: 'custom-2x4',
          name: '2x4',
          widthMm: 89,
          thicknessMm: 19,
          color: '#2f6c5d',
          availableLengths: [
            { label: '6f', lengthMm: 1829 },
            { label: '8f', lengthMm: 2438 },
          ],
        },
      ]),
    );

    const storage = new MaterialSpecStorage();

    expect(storage.loadAll()).toEqual([
      {
        id: 'custom-2x4::6f',
        name: '2x4',
        widthMm: 89,
        thicknessMm: 19,
        color: '#2f6c5d',
        stockLength: { label: '6f', lengthMm: 1829 },
      },
      {
        id: 'custom-2x4::8f',
        name: '2x4',
        widthMm: 89,
        thicknessMm: 19,
        color: '#2f6c5d',
        stockLength: { label: '8f', lengthMm: 2438 },
      },
    ]);
  });
});
