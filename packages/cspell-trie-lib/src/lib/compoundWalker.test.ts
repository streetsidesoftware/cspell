import { parseDictionary } from './SimpleDictionaryParser';
import { Trie } from './trie';
import { findWord } from './find';
import { WalkNext, WalkItem, compoundWalker, compoundWords } from './compoundWalker';

// cspell:ignore errorerror

describe('Verify compound walker', () => {
    test('compoundWords', () => {
        const trie = dictionary();
        expect(findWord(trie.root, 'errorerror').forbidden).toBe(true);
        expect(findWord(trie.root, 'ErrorCodes').found).toBe('errorcodes');
        const words1 = [...compoundWords(trie, 1)];
        expect(words1).toEqual([
            'Code',
            'Codes',
            'Error',
            'Errors',
            'Message',
            'Time',
        ]);
        const words2 = [...compoundWords(trie, 2)];
        expect(words2).toEqual(expected2());
        const words3 = [...compoundWords(trie, 3)];
        expect(words3).toContain('PrefixMiddleSuffix');
        expect(words3).toContain('PrefixErrorCodes');
        expect(words3).toHaveLength(216);
        words2.forEach(w2 => expect(words3).toContain(w2));
    });

    test('compoundWords lowercase', () => {
        const trie = dictionary();
        const words2 = [...compoundWords(trie, 2, false)];
        expect(words2).toEqual(expected2().map(a => a.toLowerCase()));
    });

    test('test compound edges', () => {
        const trie = dictionary();
        const words1 = [...filterWalker(compoundWalker(trie), 1)];
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
});

function *filterWalker(stream: Generator<WalkItem, any, WalkNext>, maxDepth: number): Generator<string> {
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

    !errorerror
    `);
}

function expected2() {
    return [
        'Code',
        'Codes',
        'CodeCode',
        'CodeCodes',
        'CodeError',
        'CodeErrors',
        'CodeMessage',
        'CodeSuffix',
        'CodeTime',
        'Error',
        'Errors',
        'ErrorCode',
        'ErrorCodes',
        'ErrorError',
        'ErrorErrors',
        'ErrorMessage',
        'ErrorSuffix',
        'ErrorTime',
        'Message',
        'MessageCode',
        'MessageCodes',
        'MessageError',
        'MessageErrors',
        'MessageMessage',
        'MessageSuffix',
        'MessageTime',
        'PrefixCode',
        'PrefixCodes',
        'PrefixError',
        'PrefixErrors',
        'PrefixMessage',
        'PrefixSuffix',
        'PrefixTime',
        'Time',
        'TimeCode',
        'TimeCodes',
        'TimeError',
        'TimeErrors',
        'TimeMessage',
        'TimeSuffix',
        'TimeTime',
    ];
}
