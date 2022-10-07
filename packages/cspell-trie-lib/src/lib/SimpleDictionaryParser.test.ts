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

    // cspell:ignore begin* *middle* *end
    const bme1 = [
        'beginmiddleend',
        'beginmiddleEnd',
        'beginMiddleend',
        'Beginmiddleend',
        'beginMiddleEnd',
        'BeginmiddleEnd',
        'BeginMiddleend',
        'BeginMiddleEnd',
        'beginend',
        'beginEnd',
        'Beginend',
    ];

    const bme2 = [
        'BeginmiddleEnd',
        'beginmiddleEnd',
        'Beginmiddleend',
        'BeginMiddleEnd',
        'beginmiddleend',
        'beginMiddleEnd',
        'BeginMiddleend',
        'beginMiddleend',
        'Beginend',
        'beginend',
        'BeginEnd',
    ];

    // cspell:ignore Midle beginmidleend gescháft cafë resumé
    test.each`
        word               | ignoreCase | has      | expected
        ${'end'}           | ${false}   | ${false} | ${['End']}
        ${'begin'}         | ${false}   | ${false} | ${['Begin']}
        ${'BeginEn'}       | ${false}   | ${false} | ${['BeginEnd', 'Begin']}
        ${'BeginMidleEnd'} | ${false}   | ${false} | ${['BeginMiddleEnd', 'BeginEnd']}
        ${'beginmidleend'} | ${true}    | ${false} | ${bme1}
        ${'BeginmidleEnd'} | ${true}    | ${false} | ${bme2}
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
        const r = trie.suggest(word, { numSuggestions: 10, ignoreCase });
        expect(r).toEqual(expected);
        expect(trie.hasWord(word, !ignoreCase)).toBe(has);
    });

    function s(line: string, on: string | RegExp = '|'): string[] {
        return line.split(on);
    }

    test.each`
        lines               | expected
        ${s('word')}        | ${s('word')}
        ${s('two-word')}    | ${s('two-word')}
        ${s('Geschäft')}    | ${s('Geschäft|~geschäft|~geschaft')}
        ${s('=Geschäft')}   | ${s('Geschäft')}
        ${s('"Geschäft"')}  | ${s('Geschäft')}
        ${s('="Geschäft"')} | ${s('Geschäft')}
        ${s('Word')}        | ${s('Word|~word')}
        ${s('*error*')}     | ${s('error|error+|+error|+error+')}
    `('parseDictionaryLines simple $lines', ({ lines, expected }) => {
        const r = [...parseDictionaryLines(lines)];
        expect(r).toEqual(expected);
    });

    test.each`
        lines                                                          | options                           | expected
        ${dictionary()}                                                | ${{}}                             | ${s('Begin|~begin|Begin+|~begin+|End|~end|+End|~+end|+Middle+|~+middle+|Café|~café|~cafe|!forbid')}
        ${s('# cspell-tools: keep-case split|Apple|Arizona|New York')} | ${{}}                             | ${s('Apple|Arizona|New|York')}
        ${s('# cspell-tools: split|Apple|Arizona|New York')}           | ${{}}                             | ${s('Apple|~apple|Arizona|~arizona|New|~new|York|~york')}
        ${s('# cspell-tools: no-split|Apple|Arizona|New York')}        | ${{ stripCaseAndAccents: false }} | ${s('Apple|Arizona|New York')}
        ${s('# cspell-tools: no-keep-case|Apple|Arizona|New York')}    | ${{ stripCaseAndAccents: false }} | ${s('Apple|~apple|Arizona|~arizona|New York|~new york')}
        ${s('Apple| # cspell-tools: keep-case|Arizona|New York')}      | ${{}}                             | ${s('Apple|~apple|Arizona|New York')}
    `('parseDictionaryLines complex $lines', ({ lines, options, expected }) => {
        const r = [...parseDictionaryLines(lines, options)];
        expect(r).toEqual(expected);
    });

    // cspell:ignore érror
    test.each`
        lines               | expected
        ${s('word')}        | ${s('word')}
        ${s('two-word')}    | ${s('two-word')}
        ${s('Geschäft')}    | ${s('Geschäft')}
        ${s('=Geschäft')}   | ${s('Geschäft')}
        ${s('"Geschäft"')}  | ${s('Geschäft')}
        ${s('="Geschäft"')} | ${s('Geschäft')}
        ${s('Word')}        | ${s('Word')}
        ${s('*error*')}     | ${s('error|error+|+error|+error+')}
        ${s('*érror*')}     | ${s('érror|érror+|+érror|+érror+')}
    `('parseDictionaryLines simple no strip $lines', ({ lines, expected }) => {
        const r = [...parseDictionaryLines(lines, { stripCaseAndAccents: false })];
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
