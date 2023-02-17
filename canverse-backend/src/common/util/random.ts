export function selectRandomly<T>(arr: T[]): T {
  // Returns undefined if arr is empty
  return arr[Math.floor(Math.random() * arr.length)];
}
