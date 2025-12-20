import { suite } from 'perf-insight';

interface SpreadObject {
    i: number;
    value: string;
    node: string;
    word: string;
}

suite('Operators', async (test) => {
    const iterations = 100_000;
    const objects: SpreadObject[] = Array.from({ length: 1000 }, (_, i) => ({
        i,
        value: i.toString(),
        node: 'node',
        word: `word ${i}`,
    }));

    test('spread omit', () => {
        let obj: Omit<SpreadObject, 'node'> | undefined;
        for (let i = iterations; i > 0; --i) {
            const { node: _, ...rest } = objects[i % objects.length];
            obj = rest;
        }
        return obj;
    });

    test('field wise assignment', () => {
        let obj: Omit<SpreadObject, 'node'> | undefined;
        for (let i = iterations; i > 0; --i) {
            const v = objects[i % objects.length];
            obj = {
                i: v.i,
                value: v.value,
                word: v.word,
            };
        }
        return obj;
    });

    test('spread explicity', () => {
        let obj: Omit<SpreadObject, 'node'> | undefined;
        for (let j = iterations; j > 0; --j) {
            const { i, value, word } = objects[j % objects.length];
            obj = { i, value, word };
        }
        return obj;
    });
});

// cspell:ignore tion aeiou
