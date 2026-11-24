import { afterEach, describe, expect, it, vi } from "vitest";
import { merge } from "../src/merge.js";

describe("merge: basic behaviour", () => {
  it("merges three non-empty collections (normal case)", () => {
    expect(merge([1, 5, 9], [8, 4, 2], [3, 6, 7])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("returns [] when all collections are empty", () => {
    expect(merge([], [], [])).toEqual([]);
  });

  it("handles two empty collections (only collection_2 has data)", () => {
    expect(merge([], [5, 3], [])).toEqual([3, 5]);
  });

  it("handles one empty collection (collection_2 empty)", () => {
    expect(merge([1, 2], [], [3, 4])).toEqual([1, 2, 3, 4]);
  });

  it("keeps duplicates that appear across collections", () => {
    expect(merge([1, 2], [2, 1], [2, 3])).toEqual([1, 1, 2, 2, 2, 3]);
  });

  it("keeps duplicates that appear inside one collection", () => {
    expect(merge([1, 1, 2], [3, 3], [])).toEqual([1, 1, 2, 3, 3]);
  });

  it("handles all values equal", () => {
    expect(merge([1], [1], [1])).toEqual([1, 1, 1]);
  });

  it("supports negative numbers", () => {
    expect(merge([-5, -1], [0, -3], [-2, 4])).toEqual([-5, -3, -2, -1, 0, 4]);
  });

  it("handles collections of different lengths", () => {
    expect(merge([1], [9, 7, 5, 3], [2, 4, 6])).toEqual([1, 2, 3, 4, 5, 6, 7, 9]);
  });

  it("handles a single element in each collection", () => {
    expect(merge([1], [2], [3])).toEqual([1, 2, 3]);
  });

  it("handles zeros and the min(0) boundary", () => {
    expect(merge([0, 0, 1], [2, 0], [0])).toEqual([0, 0, 0, 0, 1, 2]);
  });
});

describe("merge: collection_2 is read backwards", () => {
  it("collection_2 entirely smaller than the others", () => {
    // Wrong if collection_2 were read front to back: it would emit 3 first.
    expect(merge([10, 11], [3, 2, 1], [12, 13])).toEqual([1, 2, 3, 10, 11, 12, 13]);
  });

  it("collection_2 entirely larger than the others", () => {
    // Wrong if collection_2 were read front to back: it would emit 30 first.
    expect(merge([1, 2], [30, 20, 10], [3, 4])).toEqual([1, 2, 3, 4, 10, 20, 30]);
  });
});

describe("merge: purity", () => {
  it("does not mutate frozen inputs and returns a new array", () => {
    const collection1 = Object.freeze([1, 5, 9]);
    const collection2 = Object.freeze([8, 4, 2]);
    const collection3 = Object.freeze([3, 6, 7]);

    const result = merge(collection1, collection2, collection3);

    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(collection1).toEqual([1, 5, 9]);
    expect(collection2).toEqual([8, 4, 2]);
    expect(collection3).toEqual([3, 6, 7]);
    expect(result).not.toBe(collection1);
  });

  describe("no sort function is used", () => {
    afterEach(() => vi.restoreAllMocks());

    it("never calls Array.prototype.sort or toSorted", () => {
      const sortSpy = vi.spyOn(Array.prototype, "sort");
      const toSortedSpy = vi.spyOn(Array.prototype, "toSorted");

      merge([1, 5, 9], [8, 4, 2], [3, 6, 7]);

      expect(sortSpy).not.toHaveBeenCalled();
      expect(toSortedSpy).not.toHaveBeenCalled();
    });
  });
});

describe("merge: invalid input", () => {
  it("throws RangeError naming collection_1 and the index when it is unsorted", () => {
    expect(() => merge([1, 3, 2], [], [])).toThrow(RangeError);
    expect(() => merge([1, 3, 2], [], [])).toThrow(/collection_1.*\[2\]/);
  });

  it("throws RangeError naming collection_3 and the index when it is unsorted", () => {
    expect(() => merge([], [], [5, 4])).toThrow(RangeError);
    expect(() => merge([], [], [5, 4])).toThrow(/collection_3.*\[1\]/);
  });

  it("throws RangeError when collection_2 is ascending", () => {
    expect(() => merge([], [1, 2, 3], [])).toThrow(RangeError);
    expect(() => merge([], [1, 2, 3], [])).toThrow(/collection_2.*\[1\]/);
  });

  it.each([
    ["1.5", 1.5],
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["-Infinity", -Infinity],
  ])("throws TypeError for non-integer %s and names the index", (_label, bad) => {
    expect(() => merge([1, bad], [], [])).toThrow(TypeError);
    expect(() => merge([1, bad], [], [])).toThrow(/collection_1\[1\]/);
    expect(() => merge([], [bad], [])).toThrow(/collection_2\[0\]/);
    expect(() => merge([], [], [bad])).toThrow(/collection_3\[0\]/);
  });

  it("throws TypeError when an argument is not an array", () => {
    const notAnArray = "abc" as unknown as number[];
    expect(() => merge(notAnArray, [], [])).toThrow(TypeError);
    expect(() => merge(notAnArray, [], [])).toThrow(/collection_1 must be an array/);
  });

  it("throws TypeError when an element is not a number", () => {
    const withString = [1, "2"] as unknown as number[];
    expect(() => merge(withString, [], [])).toThrow(TypeError);
  });
});

// --- Randomized test -------------------------------------------------------
// The oracle must not sort either, so it checks two properties independently:
// the output is non-decreasing, and it holds exactly the same multiset of values.

/** Small seeded PRNG (mulberry32) so failures are reproducible. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/** Builds a sorted array without sorting: start somewhere, then step by a random delta. */
function randomSorted(random: () => number, direction: 1 | -1): number[] {
  const length = randomInt(random, 0, 15);
  const values: number[] = [];
  let current = randomInt(random, -30, 30);
  for (let i = 0; i < length; i++) {
    values.push(current);
    current += direction * randomInt(random, 0, 4); // delta 0 produces duplicates
  }
  return values;
}

function countValues(...collections: readonly (readonly number[])[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const collection of collections) {
    for (const value of collection) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

describe("merge: randomized (seeded)", () => {
  it("returns a non-decreasing array with the same multiset as the inputs", () => {
    const random = createRandom(20240607);

    for (let run = 0; run < 300; run++) {
      const collection1 = randomSorted(random, 1);
      const collection2 = randomSorted(random, -1);
      const collection3 = randomSorted(random, 1);

      const result = merge(collection1, collection2, collection3);

      expect(result).toHaveLength(collection1.length + collection2.length + collection3.length);
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1] as number);
      }
      expect(countValues(result)).toEqual(countValues(collection1, collection2, collection3));
    }
  });
});
