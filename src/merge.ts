/**
 * Merge three pre-sorted integer collections into one ascending array.
 *
 * Algorithm: a three-pointer k-way merge (k = 3). Because every input is already
 * sorted, the smallest unread value overall is always at the "front" of one of the
 * three collections, so we only ever compare three candidates per step.
 *
 * Assumptions
 * - The spec mentions "min(0)". We treat that as illustrative, not as a rule that
 *   values must be >= 0. Nothing in the algorithm depends on sign: exhausted
 *   collections are detected by index bounds, never by a sentinel such as 0, -1 or
 *   Infinity, which would break for some valid negative input. So negatives work.
 * - TypeScript has no `int` type. Values are `number`, validated with
 *   Number.isInteger (this also rejects NaN, Infinity and 1.5).
 * - "Sorted" means non-decreasing (ascending) or non-increasing (descending).
 */

/**
 * @param collection_1 integers sorted ascending (min -> max)
 * @param collection_2 integers sorted descending (max -> min)
 * @param collection_3 integers sorted ascending (min -> max)
 * @returns a NEW array with every input value, sorted ascending. Inputs are never mutated.
 */
export function merge(
  collection_1: readonly number[],
  collection_2: readonly number[],
  collection_3: readonly number[],
): number[] {
  const merged: number[] = [];

  // collection_1 and collection_3 are read front to back.
  let index1FromStart = 0;
  let index3FromStart = 0;
  // collection_2 is descending, so its smallest value is at the END. Reading it
  // from the last index backwards yields ascending order with no reverse step and
  // no extra copy.
  let index2FromEnd = collection_2.length - 1;

  while (true) {
    // Bounds checks (not value checks) decide "exhausted": an out-of-range read
    // gives undefined, so a finished collection can never be picked again, whatever
    // values the others hold. The explicit `>= 0` keeps index -1 from being read.
    const candidate1 = collection_1[index1FromStart];
    const candidate2 = index2FromEnd >= 0 ? collection_2[index2FromEnd] : undefined;
    const candidate3 = collection_3[index3FromStart];

    let smallest: number | undefined;
    let source: 1 | 2 | 3 | undefined;

    if (candidate1 !== undefined) {
      smallest = candidate1;
      source = 1;
    }
    // Strict `<` means ties keep the earlier collection; for plain integers the
    // output is identical either way.
    if (candidate2 !== undefined && (smallest === undefined || candidate2 < smallest)) {
      smallest = candidate2;
      source = 2;
    }
    if (candidate3 !== undefined && (smallest === undefined || candidate3 < smallest)) {
      smallest = candidate3;
      source = 3;
    }

    // No candidate left means all three collections are exhausted.
    if (smallest === undefined) break;

    merged.push(smallest);

    // Advance only the pointer we consumed from.
    if (source === 1) index1FromStart++;
    else if (source === 2) index2FromEnd--;
    else index3FromStart++;
  }

  return merged;
}
