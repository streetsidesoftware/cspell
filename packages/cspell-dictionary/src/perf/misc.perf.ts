import { genSequence } from 'gensequence';
import { loremIpsum } from 'lorem-ipsum';
import { suite } from 'perf-insight';

suite('Array Primitives', async (test) => {
    const words = genWords(20);
    const toFind = [...words, 'not-a-word'];
    const iterations = 1000;

    test('Array.find', () => {
        for (let i = 0; i < iterations; ++i) {
            for (const word of toFind) {
                words.find((w) => w === word);
            }
        }
    });

    test('genSequence.first', () => {
        for (let i = 0; i < iterations; ++i) {
            for (const word of toFind) {
                genSequence(words).first((w) => w === word);
            }
        }
    });
});

function genWords(count: number, includeForbidden = true): string[] {
    const setOfWords = new Set(loremIpsum({ count }).split(' '));

    if (includeForbidden) {
        setOfWords.add('!forbidden');
        setOfWords.add('!bad-word');
        setOfWords.add('!rejection');
    }

    while (setOfWords.size < count) {
        const words = [...setOfWords];
        for (const a of words) {
            for (const b of words) {
                if (a !== b) {
                    setOfWords.add(a + b);
                }
                if (setOfWords.size >= count) {
                    break;
                }
            }
            if (setOfWords.size >= count) {
                break;
            }
        }
    }

    return [...setOfWords];
}
