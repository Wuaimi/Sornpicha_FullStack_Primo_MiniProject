import { merge } from "./merge.js";

const collection1 = [1, 5, 9]; // ascending
const collection2 = [8, 4, 2]; // descending
const collection3 = [3, 6, 7]; // ascending

console.log(merge(collection1, collection2, collection3));
// [1, 2, 3, 4, 5, 6, 7, 8, 9]
