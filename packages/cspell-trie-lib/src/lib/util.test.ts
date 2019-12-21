import { createTriFromList, has, findNode } from './util';

describe('Validate Util Functions', () => {
    test('createTriFromList', () => {
        const trie = createTriFromList(words);
        expect(has(trie, 'sample')).toBe(true);
        expect(has(trie, 'not found')).toBe(false);
    });

    test('has', () => {
        const trie = createTriFromList(words);
        // cspell:ignore sampl
        expect(has(trie, 'sample')).toBe(true);
        expect(has(trie, 'sampl')).toBe(false);
    });

    test('find', () => {
        const trie = createTriFromList(words);
        expect(has(trie, 'sample')).toBe(true);
        // cspell:ignore sampl samp
        const n0 = findNode(trie, 'sample');
        const n1 = findNode(trie, 'sampl');
        const n2 = findNode(trie, 'samp');
        expect(n0?.f).toBeTruthy();
        expect(n1?.c?.get('e')).toBe(n0);
        expect(n2?.c?.get('l')).toBe(n1);
    });
});

const sentence = 'These are some sample words for everyone to use, complete with extra    spaces.';
const words = sentence.split(' ');
