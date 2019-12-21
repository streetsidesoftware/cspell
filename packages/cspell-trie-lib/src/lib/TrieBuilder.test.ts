import { TrieNode } from './TrieNode';
import { TrieBuilder, buildTrie } from './TrieBuilder';

describe('Validate TrieBuilder', () => {
    test('builder', () => {
        const builder = new TrieBuilder();
        builder.insert(sampleWords);
        const trie = builder.build(true);
        expect([...trie.words()].sort()).toEqual(sampleWords.sort());
        expect(countNodes(trie.root)).toBe(113);
    });

    test('builder', () => {
        const builder = new TrieBuilder();
        builder.insert(sampleWords);
        const trie = builder.build(false);
        expect([...trie.words()].sort()).toEqual(sampleWords.sort());
        expect(countNodes(trie.root)).toBe(130);
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
});

function countNodes(root: TrieNode) {
    const seen = new Set<TrieNode>();

    function walk(n: TrieNode) {
        if (seen.has(n)) return;
        seen.add(n);
        if (n.c) {
            [...n.c].forEach(([, n]) => walk(n));
        }
    }

    walk(root);
    return seen.size;
}

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
.concat(applyEndings('kill'))
;


function applyEndings(word: string): string[] {
    return ['', 'ed', 'er', 'ing', 's'].map(s => word + s);
}
