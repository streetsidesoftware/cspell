import { countNodes, isCircular } from './util';
import { TrieBuilder, buildTrie, __testing__ } from './TrieBuilder';
import { TrieNode } from '.';

const { trimSignatures, trimMap } = __testing__;

describe('Validate TrieBuilder', () => {
    test('builder explicit consolidateSuffixes', () => {
        const builder = new TrieBuilder();
        const words = sampleWords.concat(applyEndings('shock')).concat(applyEndings('stock'));
        builder.insert(words);
        const trie = builder.build(true);
        expect([...trie.words()].sort()).toEqual(sampleWords.sort());
        expect(countNodes(trie.root)).toBe(109);
        expect(isCircular(trie.root)).toBe(false);
    });

    test('builder no consolidateSuffixes', () => {
        const builder = new TrieBuilder();
        builder.insert(sampleWords);
        const trie = builder.build(false);
        expect([...trie.words()].sort()).toEqual(sampleWords.sort());
        expect(countNodes(trie.root)).toBe(121);
    });

    test('builder duplicate inserts', () => {
        const builder = new TrieBuilder(sampleWords);
        builder.insert(sampleWords);
        const trie = builder.build();
        expect([...trie.words()]).toEqual(sampleWords.sort());
    });

    test('buildTrie', () => {
        const trie = buildTrie(sampleWords);
        expect([...trie.words()]).toEqual(sampleWords.sort());
    });

    test('trimSignatures', () => {
        const n: TrieNode = {};
        const sigs = sampleWords;
        const soloSigs = sigs.filter((_, i) => !!(i & 1));
        const signatures = new Map(sigs.map((w) => [w, n]));
        const solo = new Set(soloSigs);

        // verify preconditions
        expect(signatures.size).toBe(sigs.length);
        expect(solo.size).toBe(soloSigs.length);

        // Nothing should change, solo is within bounds.
        trimSignatures(signatures, solo, sampleWords.length);
        expect(signatures.size).toBe(sigs.length);
        expect(solo.size).toBe(soloSigs.length);

        // trim and make sure the newest values are left.
        trimSignatures(signatures, solo, 5, 10);
        expect(signatures.size).toBe(sigs.length - soloSigs.length + 5);
        expect(solo.size).toBe(5);
        // verify newest are left
        expect([...solo]).toEqual(soloSigs.slice(-5));
    });

    test('trimMap', () => {
        const n: TrieNode = {};
        const values = sampleWords;
        const mapOfValues = new Map(values.map((w) => [w, n]));

        // verify preconditions
        expect(mapOfValues.size).toBe(values.length);

        // Nothing should change, solo is within bounds.
        trimMap(mapOfValues, sampleWords.length);
        expect(mapOfValues.size).toBe(values.length);

        // trim and make sure the newest values are left.
        trimMap(mapOfValues, 5, 10);
        expect(mapOfValues.size).toBe(5);
        // verify newest are left
        expect([...mapOfValues.keys()]).toEqual(values.slice(-5));
    });
});

const sampleWords = [
    'journal',
    'journalism',
    'journalist',
    'journalistic',
    'journals',
    'journey',
    'journeyer',
    'journeyman',
    'journeymen',
    'joust',
    'jouster',
    'jousting',
    'jovial',
    'joviality',
    'jowl',
    'jowly',
    'joyful',
    'joyfuller',
    'joyfullest',
    'joyfulness',
    'joyless',
    'joylessness',
    'joyous',
    'joyousness',
    'joyridden',
    'joyride',
    'joyrider',
    'joyriding',
    'joyrode',
    'joystick',
    'joy',
    'lift',
    'lifted',
    'lifter',
    'lifting',
    'lifts',
    'talk',
    'talked',
    'talker',
    'talking',
    'talks',
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'Big Apple',
    'New York',
    'apple',
    'big apple',
    'fun journey',
    'long walk',
    'fun walk',
]
    .concat(applyEndings('shock'))
    .concat(applyEndings('stock'))
    .concat(applyEndings('clock'))
    .concat(applyEndings('open'))
    .concat(applyEndings('lock'))
    .concat(applyEndings('hack'))
    .concat(applyEndings('will'))
    .concat(applyEndings('shell'))
    .concat(applyEndings('kill'));

function applyEndings(word: string): string[] {
    return ['', 'ed', 'er', 'ing', 's'].map((s) => word + s);
}
