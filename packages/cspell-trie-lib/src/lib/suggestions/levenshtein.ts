/**
 * Damerau–Levenshtein distance
 * [Damerau–Levenshtein distance - Wikipedia](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance)
 * @param a - first word
 * @param b - second word
 * @returns Distance value
 */
export function levenshteinDistance(a: string, b: string): number {
    // By prefixing with spaces, no out of bounds checks are necessary.
    const aa = '  ' + a;
    const bb = '  ' + b;

    const nA = a.length + 1;
    const nB = b.length + 1;

    const firstRow: number[] = [];
    for (let i = 0; i <= nA; ++i) {
        firstRow[i] = i;
    }

    const matrix = [firstRow, [1].concat(firstRow), [2, 1].concat(firstRow)];
    let ppRow = matrix[0];
    let pRow = matrix[1];

    for (let j = 2; j <= nB; ++j) {
        const row = matrix[j % 3];
        row[0] = pRow[0] + 1;
        row[1] = pRow[1] + 1;

        const bp = bb[j - 1];
        const bc = bb[j];

        let ap = aa[0];

        for (let i = 2, i1 = 1; i <= nA; i1 = i, ++i) {
            const ac = aa[i];
            const c = pRow[i1] + (ac == bc ? 0 : 1);
            const ct = ac == bp && ap == bc ? ppRow[i1 - 1] + 1 : c;
            row[i] = Math.min(
                c, // substitute
                ct, // transpose
                pRow[i] + 1, // insert
                row[i1] + 1 // delete
            );
            ap = ac;
        }
        ppRow = pRow;
        pRow = row;
    }

    return pRow[nA];
}
