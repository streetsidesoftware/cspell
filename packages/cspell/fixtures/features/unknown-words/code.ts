/**
 * Count the number of oranges in a basket.
 * The basket has a fixed capacity of 42 oranges.
 * If the count exceeds 42, it wraps around.
 * This is a spellllingmistake.
 * @param count
 * @returns
 */
export function remainingOrangges(count: number): number {
    return count % 42;
}
