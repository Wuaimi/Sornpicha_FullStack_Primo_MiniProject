type Order = "ascending" | "descending";

// Throws if a collection is not an array of integers in the expected order.
function validateCollection(
  name: string,
  collection: readonly number[],
  order: Order,
): void {
  // The argument must be an array.
  if (!Array.isArray(collection)) {
    throw new TypeError(`${name} must be an array`);
  }

  for (let index = 0; index < collection.length; index++) {
    const value = collection[index];

    // Every element must be an integer (rejects NaN, Infinity, floating numbers, strings).
    if (!Number.isInteger(value)) {
      throw new TypeError(
        `${name}[${index}] must be an integer, got ${String(value)}`,
      );
    }

    // The first element has no previous element to compare with.
    if (index === 0) continue;

    // Compare with the previous element to check the sort order.
    // Casts are safe because the integer check above passed.
    const previous = collection[index - 1] as number;
    const current = value as number;
    const outOfOrder = order === "ascending" ? current < previous : current > previous;
    if (outOfOrder) {
      throw new RangeError(
        `${name} must be sorted ${order}, but ${name}[${index}] = ${current} ` +
          `comes after ${name}[${index - 1}] = ${previous}`,
      );
    }
  }
}

// Merges three sorted integer collections into a new ascending array.
export function merge(
  collection_1: readonly number[],
  collection_2: readonly number[],
  collection_3: readonly number[],
): number[] {
  // Step 1: validate all inputs before doing any work.
  validateCollection("collection_1", collection_1, "ascending");
  validateCollection("collection_2", collection_2, "descending");
  validateCollection("collection_3", collection_3, "ascending");

  const merged: number[] = [];

  // Step 2: one pointer per collection.
  // collection_1 and collection_3 are read from the start (smallest first).
  // collection_2 is descending, so it is read from the end (smallest first).
  let index1FromStart = 0;
  let index3FromStart = 0;
  let index2FromEnd = collection_2.length - 1;

  // Step 3: repeatedly take the smallest remaining value until all are used.
  while (true) {
    // Current front value of each collection; undefined means it is exhausted.
    const candidate1 = collection_1[index1FromStart];
    const candidate2 = index2FromEnd >= 0 ? collection_2[index2FromEnd] : undefined;
    const candidate3 = collection_3[index3FromStart];

    let smallest: number | undefined;
    let source: 1 | 2 | 3 | undefined;

    // Pick the smallest candidate among the collections that still have values.
    if (candidate1 !== undefined) {
      smallest = candidate1;
      source = 1;
    }
    if (candidate2 !== undefined && (smallest === undefined || candidate2 < smallest)) {
      smallest = candidate2;
      source = 2;
    }
    if (candidate3 !== undefined && (smallest === undefined || candidate3 < smallest)) {
      smallest = candidate3;
      source = 3;
    }

    // No candidate left
    if (smallest === undefined) break;

    merged.push(smallest);
    
    if (source === 1) index1FromStart++;
    else if (source === 2) index2FromEnd--;
    else index3FromStart++;
  }

  return merged;
}
