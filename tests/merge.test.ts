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
