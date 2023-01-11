import type { WalkItem, WalkNext } from './compoundWalker';
import { compoundWalker, compoundWords } from './compoundWalker';
import { findWord } from './find';
import { parseDictionary } from './SimpleDictionaryParser';
import type { Trie } from './trie';

// cspell:ignore errorerror

describe('Verify compound walker', () => {
    test('compoundWords', () => {
        const trie = dictionary();
        expect(findWord(trie.root, 'errorerror').forbidden).toBe(true);
        expect(findWord(trie.root, 'errorerror').found).toBe('errorerror');
        expect(findWord(trie.root, 'ErrorCodes').found).toBe('ErrorCodes');
        const words1 = [...compoundWords(trie, 1)];
        expect(words1).toEqual(['Code', 'Codes', 'Error', 'Errors', 'Message', 'Time']);
        const words2 = [...compoundWords(trie, 2)];
        expect(words2).toEqual(expected2());
        const words3 = [...compoundWords(trie, 3)];
        expect(words3).toContain('PrefixMiddleSuffix');
        expect(words3).toContain('PrefixErrorCodes');
        expect(words3).toHaveLength(216);
        words2.forEach((w2) => expect(words3).toContain(w2));
    });

    test('compoundWords lowercase', () => {
        const trie = dictionary();
        const words2 = [...compoundWords(trie, 2, false)];
        expect(words2).toEqual(expected2().map((a) => a.toLowerCase()));
    });

    test('compound edges', () => {
        const trie = dictionary();
        const words1 = [...walkerToWords(compoundWalker(trie), 1)];
        expect(words1).toEqual([
            'Code',
            'Codes',
            'Code+',
            'Error',
            'Errors',
            'Error+',
            'Message',
            'Message+',
            'Prefix+',
            'Time',
            'Time+',
        ]);
    });

    test('that it is possible to break up the word into its compounds', () => {
        const trie = dictionary();
        const words2 = [...walkerToCompoundWords(compoundWalker(trie), 2)];
        expect(words2).toEqual(expectedCompounds2());
        const words3 = [...walkerToCompoundWords(compoundWalker(trie), 3)];
        expect(words3).toContain('Prefix+Suffix');
        expect(words3).toContain('Prefix+Middle+Suffix');
        expect(words3).not.toContain('Codes+Suffix');
    });
});

function* walkerToWords(stream: Generator<WalkItem, void, WalkNext>, maxDepth: number): Generator<string> {
    let item = stream.next();
    while (!item.done) {
        const { n, s, c, d } = item.value;
        if (n.f) {
            yield s;
        }
        if (c) {
            yield s + '+';
        }
        item = stream.next(d < maxDepth);
    }
}

function* walkerToCompoundWords(stream: Generator<WalkItem, void, WalkNext>, maxDepth: number): Generator<string> {
    let item = stream.next();
    const compounds: string[] = [];

    function compLen(n: number) {
        let cnt = 0;
        for (let i = 0; i < n; i++) {
            cnt += compounds[i].length;
        }
        return cnt;
    }

    while (!item.done) {
        const { n, s, c, d } = item.value;
        if (c) {
            // add the word to the compounds on the edge.
            compounds[d - 1] = s.slice(compLen(d - 1));
        }
        if (n.f) {
            compounds[d] = s.slice(compLen(d));
            yield compounds.slice(0, d + 1).join('+');
        }
        item = stream.next(d < maxDepth);
    }
}

function dictionary(): Trie {
    return parseDictionary(`
    # Sample dictionary
    *Error*
    *Errors
    *Code*
    *Codes
    *Message*
    *Message
    *Time*
    +Middle+
    Prefix+
    +Suffix

    !ErrorError
    ~!errorerror
    `);
}
function expected2() {
    return expectedCompounds2().map((a) => a.replace('+', ''));
}

function expectedCompounds2() {
    return [
        'Code',
        'Codes',
        'Code+Code',
        'Code+Codes',
        'Code+Error',
        'Code+Errors',
        'Code+Message',
        'Code+Suffix',
        'Code+Time',
        'Error',
        'Errors',
        'Error+Code',
        'Error+Codes',
        'Error+Error',
        'Error+Errors',
        'Error+Message',
        'Error+Suffix',
        'Error+Time',
        'Message',
        'Message+Code',
        'Message+Codes',
        'Message+Error',
        'Message+Errors',
        'Message+Message',
        'Message+Suffix',
        'Message+Time',
        'Prefix+Code',
        'Prefix+Codes',
        'Prefix+Error',
        'Prefix+Errors',
        'Prefix+Message',
        'Prefix+Suffix',
        'Prefix+Time',
        'Time',
        'Time+Code',
        'Time+Codes',
        'Time+Error',
        'Time+Errors',
        'Time+Message',
        'Time+Suffix',
        'Time+Time',
    ];
}
