import { parseDictionary, parseDictionaryLines, ParseDictionaryOptions } from './SimpleDictionaryParser';

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
        ${s('word')}        | ${s('word|~word')}
        ${s('two-word')}    | ${s('two-word|~two-word')}
        ${s('Geschäft')}    | ${s('Geschäft|~geschäft|~geschaft')}
        ${s('=Geschäft')}   | ${s('Geschäft')}
        ${s('"Geschäft"')}  | ${s('Geschäft')}
        ${s('="Geschäft"')} | ${s('Geschäft')}
        ${s('Word')}        | ${s('Word|~word')}
        ${s('*error*')}     | ${s('error|~error|error+|~error+|+error|~+error|+error+|~+error+')}
    `('parseDictionaryLines simple $lines', ({ lines, expected }) => {
        const r = [...parseDictionaryLines(lines, { stripCaseAndAccentsKeepDuplicate: true })];
        expect(r).toEqual(expected);
    });

    test.each`
        lines                                                                              | options                                        | expected
        ${dictionary()}                                                                    | ${{}}                                          | ${s('Begin|~begin|Begin+|~begin+|End|~end|+End|~+end|+Middle+|~+middle+|Café|~café|~cafe|!forbid')}
        ${s('# cspell-dictionary: no-generate-alternatives split|Apple|Arizona|New York')} | ${{}}                                          | ${s('Apple|Arizona|New|York')}
        ${s('# cspell-dictionary: split|Apple|Arizona|New York')}                          | ${{}}                                          | ${s('Apple|~apple|Arizona|~arizona|New|~new|York|~york')}
        ${s('# cspell-dictionary: no-split|Apple|Arizona|New York')}                       | ${{ stripCaseAndAccents: false }}              | ${s('Apple|Arizona|New York')}
        ${s('# cspell-dictionary: generate-alternatives|Apple|Arizona|New York')}          | ${{ stripCaseAndAccents: false }}              | ${s('Apple|~apple|Arizona|~arizona|New York|~new york')}
        ${s('Apple| # cspell-dictionary: no-generate-alternatives|Arizona|New York')}      | ${{}}                                          | ${s('Apple|~apple|Arizona|New York')}
        ${dictionary3()}                                                                   | ${{ stripCaseAndAccentsKeepDuplicate: false }} | ${s('Error|~error|Error+|~error+|+error|+error+|Code|~code|Code+|~code+|+code|+code+|msg|+msg|!err|!Errorerror|!Codemsg|Café|~café|~cafe|!codecode')}
        ${s('# cspell-dictionary: split|"New York"|Tower of London')}                      | ${{ stripCaseAndAccentsKeepDuplicate: true }}  | ${s('New York|Tower|~tower|of|~of|London|~london')}
        ${s('Hello|!Goodbye')}                                                             | ${{}}                                          | ${s('Hello|~hello|!Goodbye')}
        ${s('Hello|!Goodbye')}                                                             | ${{ stripCaseAndAccentsOnForbidden: true }}    | ${s('Hello|~hello|!Goodbye|~!goodbye')}
    `('parseDictionaryLines complex $lines', ({ lines, options, expected }) => {
        const r = [...parseDictionaryLines(lines, options)];
        expect(r).toEqual(expected);
    });

    test.each`
        lines              | options                                       | expected
        ${'New York'}      | ${pdOp({})}                                   | ${s('New York|~new york')}
        ${'New York'}      | ${pdOp({ split: true })}                      | ${s('New|~new|York|~york')}
        ${'New,York'}      | ${pdOp({ split: true, splitSeparator: ',' })} | ${s('New|~new|York|~york')}
        ${'New York Café'} | ${pdOp({ split: true })}                      | ${s('New|~new|York|~york|Café|~café|~cafe')}
        ${'New York'}      | ${pdOp({ split: true, splitKeepBoth: true })} | ${s('New|~new|York|~york|New York|~new york')}
    `('parseDictionaryLines $lines', ({ lines, options, expected }) => {
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

// cspell:ignore Errormsg msgerror codecode codemsg errorerror

function dictionary3() {
    return `
    # Sample Dictionary

    # It possible to group the dictionary into sections.
    Error*
    +error*
    Code*
    +code*
    *msg    # \`Errormsg\` is allowed, but \`msgerror\` is not.
    !err    # forbid \`err\`
    !Errorerror # forbid
    !Codemsg

    Café    # will get normalized and will only match if case sensitive matching is turned off.

    !codecode # Do not allow \`codecode\` or \`Codecode\` when using case insensitive matching.
        `;
}

function pdOp(...opts: Partial<ParseDictionaryOptions>[]): Partial<ParseDictionaryOptions> {
    const opt: Partial<ParseDictionaryOptions> = {};
    for (const p of opts) {
        Object.assign(opt, p);
    }
    return opt;
}
