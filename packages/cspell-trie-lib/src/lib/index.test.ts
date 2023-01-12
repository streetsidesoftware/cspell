import * as Trie from './index';

describe('Experiment with Tries', () => {
    test('Adds words to a Trie and takes them back out.', () => {
        const words = [...new Set(sampleWords)];
        const trie = words.reduce((t, w) => {
            return Trie.insert(w, t);
        }, {} as Trie.TrieNode);
        expect(trie.c).toBeDefined();
        const extractedWords = [...Trie.iteratorTrieWords(trie)];
        expect(extractedWords).toEqual(words);
    });

    test('Adds words to a Trie sorts the trie and takes them back out.', () => {
        const words = [...new Set(sampleWords)];
        const trie = Trie.createTriFromList(words);
        expect(trie.c).toBeDefined();
        Trie.orderTrie(trie);
        const extractedWords = [...Trie.iteratorTrieWords(trie)];
        expect(extractedWords).toEqual(words.sort());
    });

    test('buildReferenceTree', () => {
        const words = [...new Set(sampleWords)];
        const trie = Trie.createTriFromList(words);
        const asString = [...Trie.serializeTrie(trie, 10)].join('');
        const trie2 = Trie.createTriFromList(words);
        const asString2 = [...Trie.serializeTrie(trie2, { base: 10, addLineBreaksToImproveDiffs: false })].join('');
        expect(asString2).toBe(asString);
        const trie3 = Trie.createTriFromList(words);
        const asString3 = [
            ...Trie.serializeTrie(trie3, {
                base: 10,
                comment: 'one\ntwo\nthree',
                addLineBreaksToImproveDiffs: false,
            }),
        ].join('');
        expect(asString3).not.toBe(asString);
        expect(asString3.slice(asString3.indexOf('# Data'))).toBe(asString.slice(asString.indexOf('# Data')));
        expect(asString3).toEqual(expect.stringContaining('\n# one\n# two\n# three'));
        const root = Trie.importTrie(asString.split('\n'));
        {
            const trie = words.reduce((t, w) => {
                return Trie.insert(w, t);
            }, {} as Trie.TrieNode);
            const trie2 = root;
            const extractedWords1 = [...Trie.iteratorTrieWords(trie)];
            const extractedWords2 = [...Trie.iteratorTrieWords(trie2)];
            expect(extractedWords2.sort()).toEqual(extractedWords1.sort());
        }
    });

    test('buildReferenceTree default base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie)].join('');
        expect(text).toEqual(expect.stringContaining('base=16'));
    });

    test('buildReferenceTree too low base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie, 5)].join('');
        expect(text).toEqual(expect.stringContaining('base=10'));
    });

    test('buildReferenceTree too high base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie, 100)].join('');
        expect(text).toEqual(expect.stringContaining('base=36'));
    });

    test('buildReferenceTree undefined base', () => {
        const trie = Trie.createTriFromList(sampleWords);
        const text = [...Trie.serializeTrie(trie, {})].join('');
        expect(text).toEqual(expect.stringContaining('base=16'));
    });
});

const sampleWords = [
    'walk',
    'walked',
    'walker',
    'walking',
    'walks',
    'talk',
    'talks',
    'talked',
    'talker',
    'talking',
    'lift',
    'lifts',
    'lifted',
    'lifter',
    'lifting',
    'journal',
    'journals',
    'journalism',
    'journalist',
    'journalistic',
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
    'joy',
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
];
