/**
 * Deterministic seedable RNG (mulberry32).
 *
 * Used by the demo data generators so the dashboard renders the exact same
 * numbers on every reload. Switch the seed in seed.ts to refresh the dataset.
 */

export type Rng = {
  next(): number;
  int(min: number, max: number): number;
  float(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  weighted<T>(items: ReadonlyArray<readonly [T, number]>): T;
};

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min;
  }

  function float(min: number, max: number): number {
    return next() * (max - min) + min;
  }

  function pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("rng.pick: empty array");
    }
    return items[int(0, items.length - 1)] as T;
  }

  function weighted<T>(
    items: ReadonlyArray<readonly [T, number]>
  ): T {
    const total = items.reduce((acc, [, w]) => acc + w, 0);
    let r = next() * total;
    for (const [item, w] of items) {
      r -= w;
      if (r <= 0) return item;
    }
    return items[items.length - 1]![0];
  }

  return { next, int, float, pick, weighted };
}
