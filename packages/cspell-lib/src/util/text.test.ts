import { opConcatMap, pipeSync as pipe, toArray } from '@cspell/cspell-pipe';
import type { TextOffset } from '@cspell/cspell-types';
import * as Text from './text';
import { splitCamelCaseWord } from './text';

// cSpell:ignore Ápple DBAs ctrip γάμμα

describe('Util Text', () => {
    test.each`
        pattern      | expected
        ${''}        | ${undefined}
        ${'a'}       | ${/a/gimu}
        ${'/'}       | ${/\//gimu}
        ${'/.*/'}    | ${/.*/g}
        ${'/.*/m'}   | ${/.*/gm}
        ${'/.*/gi'}  | ${/.*/gi}
        ${'/.*/giu'} | ${/.*/giu}
        ${/abc/}     | ${/abc/}
        ${/abc/gu}   | ${/abc/gu}
    `('tests build regexp from string', ({ pattern, expected }) => {
        expect(Text.stringToRegExp(pattern)).toEqual(expected);
    });

    test('splits words', () => {
        expect(splitCamelCaseWord('hello')).toEqual(['hello']);
        expect(splitCamelCaseWord('helloThere')).toEqual(['hello', 'There']);
        expect(splitCamelCaseWord('HelloThere')).toEqual(['Hello', 'There']);
        expect(splitCamelCaseWord('BigÁpple')).toEqual(['Big', 'Ápple']);
        expect(splitCamelCaseWord('ASCIIToUTF16')).toEqual(['ASCII', 'To', 'UTF16']);
        expect(splitCamelCaseWord('URLsAndDBAs')).toEqual(['Urls', 'And', 'Dbas']);
        expect(splitCamelCaseWord('WALKingRUNning')).toEqual(['Walking', 'Running']);
    });

    test('extract word from text', () => {
        expect(
            toArray(
                Text.extractWordsFromText(
                    `
            // could've, would've, couldn't've, wasn't, y'all, 'twas, shouldn’t
        `
                )
            )
        ).toEqual([
            { text: "could've", offset: 16 },
            { text: "would've", offset: 26 },
            { text: "couldn't've", offset: 36 },
            { text: "wasn't", offset: 49 },
            { text: "y'all", offset: 57 },
            { text: 'twas', offset: 65 },
            { text: 'shouldn’t', offset: 71 },
        ]);
    });

    test('extract words', () => {
        expect(
            toArray(
                Text.extractWordsFromText(
                    `
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `
                )
            )
        ).toEqual([
            { text: 'expect', offset: 13 },
            { text: 'splitCamelCaseWord', offset: 20 },
            { text: 'hello', offset: 40 },
            { text: 'to', offset: 49 },
            { text: 'deep', offset: 52 },
            { text: 'equal', offset: 57 },
            { text: 'hello', offset: 65 },
        ]);
        expect(
            toArray(
                Text.extractWordsFromText(
                    `
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `
                )
            )
        ).toEqual([
            { text: 'expect', offset: 13 },
            { text: 'splitCamelCaseWord', offset: 20 },
            { text: 'hello', offset: 40 },
            { text: 'to', offset: 49 },
            { text: 'deep', offset: 52 },
            { text: 'equal', offset: 57 },
            { text: 'hello', offset: 65 },
        ]);
        expect(
            toArray(
                Text.extractWordsFromText(
                    `
            expect(splitCamelCaseWord('hello'));
        `
                )
            )
        ).toEqual([
            { text: 'expect', offset: 13 },
            { text: 'splitCamelCaseWord', offset: 20 },
            { text: 'hello', offset: 40 },
        ]);
    });

    test('extract words from code', () => {
        expect(
            toArray(
                Text.extractWordsFromCode(
                    `
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `
                )
            )
        ).toEqual([
            { text: 'expect', offset: 13 },
            { text: 'split', offset: 20 },
            { text: 'Camel', offset: 25 },
            { text: 'Case', offset: 30 },
            { text: 'Word', offset: 34 },
            { text: 'hello', offset: 40 },
            { text: 'to', offset: 49 },
            { text: 'deep', offset: 52 },
            { text: 'equal', offset: 57 },
            { text: 'hello', offset: 65 },
        ]);
        expect(
            toArray(
                Text.extractWordsFromCode(
                    `
            expect(regExp.match(first_line));
        `
                )
            )
        ).toEqual([
            { text: 'expect', offset: 13 },
            { text: 'reg', offset: 20 },
            { text: 'Exp', offset: 23 },
            { text: 'match', offset: 27 },
            { text: 'first', offset: 33 },
            { text: 'line', offset: 39 },
        ]);
        expect(
            toArray(
                Text.extractWordsFromCode(
                    `
            expect(aHELLO);
        `
                )
            )
        ).toEqual([
            { text: 'expect', offset: 13 },
            { text: 'a', offset: 20 },
            { text: 'HELLO', offset: 21 },
        ]);
        // cspell:ignore shouldn
        const t = "\n            const x = 'shouldn\\'t';\n        ";

        expect(toArray(Text.extractWordsFromCode(t))).toEqual([
            { text: 'const', offset: 13 },
            { text: 'x', offset: 19 },
            { text: "shouldn\\'t", offset: 24 },
        ]);
    });

    test('splits words like HTMLInput', () => {
        const words = toArray(Text.extractWordsFromCode('var value = HTMLInput.value;')).map(({ text }) => text);
        expect(words).toEqual(['var', 'value', 'HTML', 'Input', 'value']);
    });

    test('tests matchCase', () => {
        expect(Text.matchCase('Apple', 'orange')).toBe('Orange');
        expect(Text.matchCase('apple', 'ORANGE')).toBe('orange');
        expect(Text.matchCase('apple', 'orange')).toBe('orange');
        expect(Text.matchCase('APPLE', 'orange')).toBe('ORANGE');
        expect(Text.matchCase('ApPlE', 'OrangE')).toBe('OrangE');
        expect(Text.matchCase('apPlE', 'OrangE')).toBe('orangE');
    });

    test('tests skipping Chinese characters', () => {
        expect(
            toArray(
                Text.extractWordsFromCode(
                    `
            <a href="http://www.ctrip.com" title="携程旅行网">携程旅行网</a>
        `
                )
            ).map((wo) => wo.text)
        ).toEqual(['a', 'href', 'http', 'www', 'ctrip', 'com', 'title', 'a']);
    });

    test('tests skipping Japanese characters', () => {
        expect(
            toArray(
                Text.extractWordsFromCode(
                    `
            Example text: gitのpackageのみ際インストール
            gitのpackageのみ際インストール
            title="携程旅行网"
        `
                )
            ).map((wo) => wo.text)
        ).toEqual(['Example', 'text', 'git', 'package', 'git', 'package', 'title']);
    });

    test('tests Greek characters', () => {
        expect(
            toArray(
                Text.extractWordsFromCode(
                    `
            Γ γ	gamma, γάμμα
        `
                )
            ).map((wo) => wo.text)
        ).toEqual(['Γ', 'γ', 'gamma', 'γάμμα']);
    });

    test.each`
        text                | expected
        ${'hello'}          | ${['hello']}
        ${nfc('café')}      | ${[nfc('café')]}
        ${nfd('café')}      | ${[nfd('café')]}
        ${nfd('caféStyle')} | ${[nfd('café'), 'Style']}
        ${nfc('caféÁ')}     | ${[nfc('café'), nfc('Á')]}
        ${nfd('caféÁ')}     | ${[nfd('café'), nfd('Á')]}
    `('extractWordsFromCode "$text"', ({ text, expected }) => {
        const r = toArray(Text.extractWordsFromCode(text)).map((wo) => wo.text);
        expect(r).toEqual(expected);
    });

    test('case of Chinese characters', () => {
        expect(Text.isUpperCase('携程旅行网')).toBe(false);
        expect(Text.isLowerCase('携程旅行网')).toBe(false);
    });

    test('tests breaking up text into lines', () => {
        const parts = ['', '/*', ' * this is a comment.\r', ' */', ''];
        const sampleText = parts.join('\n');
        const r = toArray(Text.extractLinesOfText(sampleText)).map((a) => a.text);
        expect(r.join('')).toBe(parts.join('\n'));
        const lines = [...Text.extractLinesOfText(sampleCode)].map((m) => m.text);
        expect(lines.length).toBe(sampleCode.split('\n').length);
    });

    test('tests breaking up text into lines (single line)', () => {
        const parts = ['There is only one line.'];
        const sampleText = parts.join('\n');
        const r = toArray(Text.extractLinesOfText(sampleText)).map((a) => a.text);
        const rText = r.join('');
        expect(rText).toBe(parts.join('\n'));
        expect(rText).toBe(sampleText);
    });

    test('tests extractLinesOfText', () => {
        const linesA = [...Text.extractLinesOfText(sampleCode)].map((m) => m.text);
        const linesB = toArray(Text.extractLinesOfText(sampleCode)).map((m) => m.text);
        expect(linesB).toEqual(linesA);
    });

    test('extractText', () => {
        const line = Text.textOffset('This is a line of text to be processed.');
        const words = toArray(Text.extractWordsFromTextOffset(line));
        const results = words.map((wo) => Text.extractText(line, wo.offset, wo.offset + wo.text.length));
        const expected = words.map((wo) => wo.text);
        expect(results).toEqual(expected);
    });
});

describe('Test the text matching functions', () => {
    test('isUpperCase', () => {
        expect(Text.isUpperCase('first')).toBe(false);
        expect(Text.isUpperCase('First')).toBe(false);
        expect(Text.isUpperCase('FIRST')).toBe(true);
    });
    test('isLowerCase', () => {
        expect(Text.isLowerCase('first')).toBe(true);
        expect(Text.isLowerCase('First')).toBe(false);
        expect(Text.isLowerCase('FIRST')).toBe(false);
    });
    test('isFirstCharacterUpper', () => {
        expect(Text.isFirstCharacterUpper('first')).toBe(false);
        expect(Text.isFirstCharacterUpper('First')).toBe(true);
        expect(Text.isFirstCharacterUpper('FIRST')).toBe(true);
    });
    test('isFirstCharacterLower', () => {
        expect(Text.isFirstCharacterLower('first')).toBe(true);
        expect(Text.isFirstCharacterLower('First')).toBe(false);
        expect(Text.isFirstCharacterLower('FIRST')).toBe(false);
    });
    // cSpell:ignore áello firstname
    test('ucFirst', () => {
        expect(Text.ucFirst('hello')).toBe('Hello');
        expect(Text.ucFirst('Hello')).toBe('Hello');
        expect(Text.ucFirst('áello')).toBe('Áello');
    });
    test('lcFirst', () => {
        expect(Text.lcFirst('hello')).toBe('hello');
        expect(Text.lcFirst('Hello')).toBe('hello');
        expect(Text.lcFirst('áello')).toBe('áello');
        expect(Text.lcFirst('Áello')).toBe('áello');
    });
    test('snakeToCamel', () => {
        expect(Text.snakeToCamel('first')).toBe('First');
        expect(Text.snakeToCamel('firstName')).toBe('FirstName');
        expect(Text.snakeToCamel('first_name')).toBe('FirstName');
        expect(Text.snakeToCamel('FIRST_NAME')).toBe('FIRSTNAME');
    });
    test('camelToSnake', () => {
        expect(Text.camelToSnake('first')).toBe('first');
        expect(Text.camelToSnake('firstName')).toBe('first_name');
        expect(Text.camelToSnake('first_name')).toBe('first_name');
        expect(Text.camelToSnake('FIRSTName')).toBe('first_name');
        expect(Text.camelToSnake('FIRSTNAME')).toBe('firstname');
    });
});

const regExWordsAndDigits = Text.__testing__.regExWordsAndDigits;

describe('Validate individual regexp', () => {
    interface RegExpTestCase {
        testName: string;
        regexp: RegExp;
        text: string;
        expectedResult: (string | number)[];
    }
    // cspell:ignore geschäft
    test.each`
        testName                 | regexp                 | text                           | expectedResult
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${''}                          | ${[]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${" x = 'Don\\'t'"}            | ${['x', 1, "'Don\\'t'", 5]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'12345'}                     | ${[]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'12345a'}                    | ${['12345a', 0]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'geschäft'}                  | ${['geschäft', 0]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'geschäft'.normalize('NFD')} | ${['geschäft'.normalize('NFD'), 0]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'b12345'}                    | ${['b12345', 0]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'b12345a'}                   | ${['b12345a', 0]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'b12_345a'}                  | ${['b12_345a', 0]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'well-educated'}             | ${['well-educated', 0]}
        ${'regExWordsAndDigits'} | ${regExWordsAndDigits} | ${'DB\\Driver\\Manager'}       | ${['DB', 0, 'Driver', 3, 'Manager', 10]}
    `('$testName `$text`', ({ regexp, text, expectedResult }: RegExpTestCase) => {
        const r = match(regexp, text);
        expect(r).toEqual(expectedResult);
    });
});

describe('Validates offset conversions', () => {
    function* getOffsets(haystack: string, needle: string) {
        let offset = -1;
        do {
            offset = haystack.indexOf(needle, offset + 1);
            if (offset > 0) {
                yield { offset, text: needle } as TextOffset;
            } else {
                break;
            }
        } while (true);
    }

    test.each`
        text
        ${'const'}
        ${'disable'}
        ${'text'}
    `('calculateTextDocumentOffsets for $text', ({ text }) => {
        const offsets = [...getOffsets(sampleCode, text)];
        const results = Text.calculateTextDocumentOffsets('uri', sampleCode, offsets);
        expect(Object.keys(results)).not.toHaveLength(0);
        results.forEach(({ doc, text, offset, line }) => {
            expect(doc).toBe(sampleCode);
            const offsetInLine = offset - line.offset;
            expect(line.text.slice(offsetInLine, offsetInLine + text.length)).toBe(text);
        });

        expect(results.map(({ doc: _doc, ...rest }) => rest)).toMatchSnapshot();
    });
});

function nfc(s: string): string {
    return s.normalize('NFC');
}

function nfd(s: string): string {
    return s.normalize('NFD');
}

function match(regexp: RegExp, text: string): (string | number)[] {
    const x = toArray(
        pipe(
            Text.matchStringToTextOffset(regexp, text),
            opConcatMap((t) => [t.text, t.offset])
        )
    );
    return x;
}

const sampleCode = `
/*
 * this is a comment.\r
 */

const text = 'some nice text goes here';
const url = 'https://www.google.com?q=typescript';
const url2 = 'http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe';
const cssHexValue = '#cccd';
const cHexValue = 0x5612abcd;
const cHexValueBadCoffee = 0xbadc0ffee;

// spell-checker:disable
const unicodeHexValue = '\\uBABC';
const unicodeHexValue2 = '\\x{abcd}';

// spell-checker:enable

/* More code and comments */

// Make sure /* this works.

/* spell-checker:disable */

// nested disabled checker is not supported.

// spell-checker:disable

// nested spell-checker:enable <--> checking is now turned on.

// This will be checked

/*
 * spell-checker:enable  <-- this makes no difference because it was already turned back on.
 */

let text = '';
for (let i = 0; i < 99; ++i) {
    text += ' ' + i;
}

const string1 = 'This is a single quote string.  it\\'s a lot of fun.'
const string2 = "How about a double quote string?";
const templateString = \`
can contain " and '

 \`;

$phpHereDocString = <<<SQL
    SELECT * FROM users WHERE id in :ids;
SQL;

$phpHereDocString = <<<"SQL"
    SELECT * FROM users WHERE id in :ids;
SQL;

$phpNowDocString = <<<'SQL'
    SELECT * FROM users WHERE id in :ids;
SQL;

// cSpell:disable

Not checked.

`;
