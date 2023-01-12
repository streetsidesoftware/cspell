import { countNodes, countWords, createTriFromList, findNode, has, isCircular, iteratorTrieWords } from './trie-util';
import { mergeDefaults } from './utils/mergeDefaults';

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

    test('countNodes', () => {
        const trie = createTriFromList(words);
        expect(countNodes(trie)).toBe(73);
    });

    test('isCircular', () => {
        const trie = createTriFromList(words);
        expect(isCircular(trie)).toBe(false);
        const n = findNode(trie, 'samp');
        n?.c?.set('x', trie);
        expect(isCircular(trie)).toBe(true);
    });

    test('countWords', () => {
        const trie = createTriFromList(words);
        expect(countWords(trie)).toBe(19);
        const n = findNode(trie, 'samp');
        n?.c?.set('x', trie);
        expect(isCircular(trie)).toBe(true);
        expect(countWords(trie)).toBe(19);
    });

    test('iteratorTrieWords', () => {
        const trie = createTriFromList(words);
        expect([...iteratorTrieWords(trie)].join(' ')).toBe(
            'These There are some someone sample space spaces. words worry. with for everyone extra to use, complete is no'
        );
    });

    test('mergeDefaults', () => {
        const a = { a: 1, b: 'b', c: 'c' };
        const b = { a: 3, b: 'bb' };

        expect(mergeDefaults(a, b)).toEqual({ a: 1, b: 'b' });
        expect(mergeDefaults(b, a)).toEqual({ a: 3, b: 'bb', c: 'c' });
    });
});

const sentence =
    'These are some sample words for everyone to use, complete with extra    spaces. There is no space for someone to worry.';
const words = sentence.split(' ');
