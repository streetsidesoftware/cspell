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
            '~café',
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
            '~café',
            '~end',
        ]);
    });

    test('Auto generate cases', () => {
        const words = ['!forbid', '*End', '+Middle+', 'Begin*', 'Café'];
        const expected = [
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
            '~café',
            '~end',
        ];
        const trie = parseDictionary(words.join('\n'));
        const result = [...trie.words()];
        expect(result).toEqual(expected);
    });

    test('preserve cases', () => {
        const words = ['!forbid', '+End', '+Middle+', 'Begin', 'Begin+', 'Café', 'End'];
        const trie = parseDictionary(words.join('\n'), { stripCaseAndAccents: false });
        const result = [...trie.words()];
        expect(result).toEqual(words);
    });

    function toL(a: string): string {
        return a.toLowerCase();
    }

    // cspell:ignore Midle beginmidleend gescháft cafë resumé
    test.each`
        word               | ignoreCase | has      | expected
        ${'end'}           | ${false}   | ${false} | ${['End']}
        ${'begin'}         | ${false}   | ${false} | ${['Begin']}
        ${'BeginEn'}       | ${false}   | ${false} | ${['BeginEnd', 'Begin']}
        ${'BeginMidleEnd'} | ${false}   | ${false} | ${['BeginMiddleEnd', 'BeginEnd']}
        ${'beginmidleend'} | ${true}    | ${false} | ${[toL('BeginMiddleEnd'), 'BeginMiddleEnd', toL('BeginEnd'), 'BeginEnd']}
        ${'BeginmidleEnd'} | ${true}    | ${false} | ${['BeginMiddleEnd', toL('BeginMiddleEnd'), toL('BeginEnd'), 'BeginEnd']}
        ${'cafe'}          | ${false}   | ${false} | ${['Café']}
        ${'cafe'}          | ${true}    | ${true}  | ${['cafe', 'café', 'Café']}
        ${'cafë'}          | ${true}    | ${false} | ${['cafe', 'café', 'Café']}
        ${'café'}          | ${true}    | ${true}  | ${['café', 'cafe', 'Café']}
        ${'end'}           | ${true}    | ${true}  | ${['end', 'End']}
        ${'begin'}         | ${true}    | ${true}  | ${['begin', 'Begin']}
        ${'ind'}           | ${true}    | ${false} | ${['end', 'End']}
        ${'agin'}          | ${true}    | ${false} | ${['begin', 'Begin']}
        ${'Middle'}        | ${false}   | ${false} | ${[]}
        ${'BeginMiddle'}   | ${false}   | ${false} | ${['BeginMiddleEnd', 'BeginEnd']}
        ${'geschäft'}      | ${false}   | ${false} | ${['Geschäft']}
        ${'geschaft'}      | ${false}   | ${false} | ${['Geschäft']}
        ${'gescháft'}      | ${false}   | ${false} | ${['Geschäft']}
        ${'geschäft'}      | ${true}    | ${true}  | ${['geschäft', 'geschaft', 'Geschäft']}
        ${'geschaft'}      | ${true}    | ${true}  | ${['geschaft', 'geschäft', 'Geschäft']}
        ${'gescháft'}      | ${true}    | ${false} | ${['geschaft', 'geschäft', 'Geschäft']}
        ${'resume'}        | ${false}   | ${false} | ${['resumé']}
    `('suggest "$word" ignore case $ignoreCase', ({ word, ignoreCase, has, expected }) => {
        const trie = parseDictionary(dictionary2());
        const r = trie.suggest(word, 10, undefined, undefined, ignoreCase);
        expect(r).toEqual(expected);
        expect(trie.hasWord(word, !ignoreCase)).toBe(has);
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

// cspell:ignore Geschäft
function dictionary2() {
    const moreWords = `
    Geschäft

    resumé

    `;
    return dictionary() + moreWords;
}
