import { parseDictionary, parseDictionaryLines } from './SimpleDictionaryParser';

describe('Validate SimpleDictionaryParser', () => {
    test('parsing lines', () => {
        const expected = [
            'Begin',
            '~begin',
            'Begin+',
            '~begin+',
            'End',
            '~end',
            '+End',
            '~+end',
            '+Middle+',
            '~+middle+',
            'Café',
            '~cafe',
            '!forbid',
        ];
        // Basic test
        expect([...parseDictionaryLines(dictionary().split('\n'))]).toEqual(expected);
        // Use expanded accents
        expect([...parseDictionaryLines(dictionary().normalize('NFD').split('\n'))]).toEqual(expected);
    });

    test('basic test', () => {
        const trie = parseDictionary(dictionary());
        const result = [...trie.words()];
        expect(result).toEqual([
            '!forbid',
            '+End',
            '+Middle+',
            'Begin',
            'Begin+',
            'Café',
            'End',
            '~+end',
            '~+middle+',
            '~begin',
            '~begin+',
            '~cafe',
            '~end',
        ]);
    });

    function s(line: string, on: string | RegExp = '|'): string[] {
        return line.split(on);
    }

    test.each`
        lines            | expected
        ${s('word')}     | ${s('word')}
        ${s('two-word')} | ${s('two-word')}
        ${s('Word')}     | ${s('Word|~word')}
        ${s('*error*')}  | ${s('error|error+|+error|+error+')}
    `('parseDictionaryLines simple $lines', ({ lines, expected }) => {
        const r = [...parseDictionaryLines(lines)];
        expect(r).toEqual(expected);
    });
});

function dictionary() {
    return `
    # This is a comment.

    Begin*
    *End
    +Middle+
    Café        # é becomes e
    !forbid     # do not allow "forbid"
    `;
}
