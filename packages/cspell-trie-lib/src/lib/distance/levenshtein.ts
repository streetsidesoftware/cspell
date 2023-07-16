const initialRow = '.'
    .repeat(50)
    .split('')
    .map((_, i) => i);

Object.freeze(initialRow);

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

    const firstRow: number[] = initialRow.slice(0, nA + 1);
    for (let i = firstRow.length; i <= nA; ++i) {
        firstRow[i] = i;
    }

    const matrix = [firstRow, [1, ...firstRow], [2, 1, ...firstRow]];
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
                row[i1] + 1, // delete
            );
            ap = ac;
        }
        ppRow = pRow;
        pRow = row;
    }

    return pRow[nA];
}

export interface NearestWords {
    word: string;
    dist: number;
}

export function selectNearestWords(
    word: string,
    words: Iterable<string>,
    count: number,
    maxEdits: number,
): NearestWords[] {
    const resultsByCost: NearestWords[][] = [];

    const a = word;
    // By prefixing with spaces, no out of bounds checks are necessary.
    const aa = '  ' + a;
    const nA = a.length + 1;
    let n = 0;
    let lastWord = '';
    let stoppedAt = 0;

    const firstRow: number[] = initialRow.slice(0, nA + 1);
    for (let i = firstRow.length; i <= nA; ++i) {
        firstRow[i] = i;
    }

    const matrix = [firstRow, [1, ...firstRow], [2, 1, ...firstRow]];

    for (const b of words) {
        const dist = levenshteinDistance(b);
        if (dist === undefined || dist > maxEdits) continue;

        ++n;
        const r = resultsByCost[dist] || (resultsByCost[dist] = []);
        r.push({ word: b, dist });
        if (n > count && dist < maxEdits) {
            n = 0;
            for (let i = 0; i < resultsByCost.length; ++i) {
                const r = resultsByCost[i];
                if (!r) continue;
                n += r.length;
                if (n > count) {
                    maxEdits = i;
                    break;
                }
            }
        }
    }

    // console.warn(
    //     'maxEdit %o, results: %o',
    //     maxEdits,
    //     resultsByCost.map((r) => r.length)
    // );

    const results = resultsByCost.reduce((acc, r) => (acc.length < count ? acc.concat(r) : acc), []);
    return results.slice(0, count);

    function levenshteinDistance(b: string): number | undefined {
        const bb = '  ' + b;

        const nB = b.length + 1;

        let j = 0;

        const lw = lastWord;
        for (; j < lw.length && b[j] === lw[j] && j < stoppedAt; ++j) {
            // empty
        }

        let ppRow = matrix[j];
        let pRow = matrix[j + 1];
        let min = pRow[0];
        const max = maxEdits;

        for (j += 2; j <= nB; ++j) {
            const row = matrix[j] || (matrix[j] = []);
            row[0] = pRow[0] + 1;
            row[1] = pRow[1] + 1;

            const bp = bb[j - 1];
            const bc = bb[j];

            let ap = aa[0];

            for (let i = 2, i1 = 1; i <= nA; i1 = i, ++i) {
                const ac = aa[i];
                const c = pRow[i1] + (ac == bc ? 0 : 1);
                const ct = ac == bp && ap == bc ? ppRow[i1 - 1] + 1 : c;
                const v = Math.min(
                    c, // substitute
                    ct, // transpose
                    pRow[i] + 1, // insert
                    row[i1] + 1, // delete
                );
                row[i] = v;
                min = v < min ? v : min;
                ap = ac;
            }
            ppRow = pRow;
            pRow = row;
            if (min > max) {
                lastWord = b;
                stoppedAt = j - 2;
                return undefined;
            }
        }

        lastWord = b;
        stoppedAt = j - 2;

        return pRow[nA];
    }
}
