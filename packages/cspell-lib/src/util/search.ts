/**
 * Search for an item in a sorted array.
 * The value returned is either the position of the item or where it should be inserted.
 */
export function binarySearch<T>(arr: Array<T>, item: T, leftOffset?: number, rightOffset?: number): number {
    let left = Math.max(leftOffset ?? 0, 0);
    let right = Math.min(rightOffset ?? arr.length, arr.length);

    while (left < right) {
        const pos = (left + right) >> 1;
        if (arr[pos] < item) {
            left = pos + 1;
        } else {
            right = pos;
        }
    }

    return left;
}
