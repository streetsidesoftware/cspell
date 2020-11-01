import {
    parseDictionary,
    parseDictionaryLines,
} from './SimpleDictionaryParser';

describe('Validate SimpleDictionaryParser', () => {
    test('test parsing lines', () => {
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
        expect([...parseDictionaryLines(dictionary().split('\n'))]).toEqual(
            expected
        );
        // Use expanded accents
        expect([
            ...parseDictionaryLines(dictionary().normalize('NFD').split('\n')),
        ]).toEqual(expected);
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
