import { suite } from 'perf-insight';

suite('trie has', async (test) => {
    const chars = [...charSet()];
    const charRecord = Object.fromEntries(chars.map((c) => [c, c.codePointAt(0)]));
    const charMap = new Map(Object.entries(charRecord));

    const lookUp = randomCharString(chars, 1000);
    const iterations = 100;

    test('Map.get', () => {
        let sum = 0;
        for (let i = 0; i < iterations; ++i) {
            for (const c of lookUp) {
                sum += charMap.get(c) || 0;
            }
        }
        return sum;
    });

    test('Record.get', () => {
        let sum = 0;
        for (let i = 0; i < iterations; ++i) {
            for (const c of lookUp) {
                sum += charRecord[c] || 0;
            }
        }
        return sum;
    });

    test('Map.has', () => {
        let sum = 0;
        for (let i = 0; i < iterations; ++i) {
            for (const c of lookUp) {
                sum += (charMap.has(c) && 1) || 0;
            }
        }
        return sum;
    });

    test('Record.has', () => {
        let sum = 0;
        for (let i = 0; i < iterations; ++i) {
            for (const c of lookUp) {
                sum += (c in charRecord && 1) || 0;
            }
        }
        return sum;
    });

    test('Map.has.get', () => {
        let sum = 0;
        for (let i = 0; i < iterations; ++i) {
            for (const c of lookUp) {
                if (charMap.has(c)) {
                    sum += charMap.get(c)!;
                }
            }
        }
        return sum;
    });

    test('Record.has.get', () => {
        let sum = 0;
        for (let i = 0; i < iterations; ++i) {
            for (const c of lookUp) {
                if (c in charRecord) {
                    sum += charRecord[c]!;
                }
            }
        }
        return sum;
    });
});

function charSet() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return new Set(letters.toUpperCase() + letters);
}

function randomCharString(chars: string[], count: number): string[] {
    const len = chars.length;
    return Array.from({ length: count }, () => chars[Math.floor(Math.random() * len)]);
}

// cspell:ignore tion aeiou
