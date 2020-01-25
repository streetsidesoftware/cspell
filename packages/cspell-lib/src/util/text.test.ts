import { splitCamelCaseWord } from './text';
import * as Text from './text';

// cSpell:ignore Ápple DBAs ctrip γάμμα

describe('Util Text', () => {
    test('tests build regexp from string', () => {
        const regEx1 = Text.stringToRegExp('');
        expect(regEx1).toBeUndefined();
        const regEx2 = Text.stringToRegExp('a');
        expect(regEx2!.toString()).toBe('/a/gim');
        const regEx3 = Text.stringToRegExp('/');
        expect(regEx3).not.toBeUndefined();
        expect(regEx3!.toString()).toBe('/\\//gim');
        const regEx4 = Text.stringToRegExp(/abc/);
        expect(regEx4!.toString()).toBe('/abc/');
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
        expect(Text.extractWordsFromText(`
            // could've, would've, couldn't've, wasn't, y'all, 'twas, shouldn’t
        `).toArray()).toEqual([
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
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `).toArray()).toEqual([
                { text: 'expect', offset: 13 },
                { text: 'splitCamelCaseWord', offset: 20 },
                { text: 'hello', offset: 40 },
                { text: 'to', offset: 49 },
                { text: 'deep', offset: 52 },
                { text: 'equal', offset: 57 },
                { text: 'hello', offset: 65 },
            ]);
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `).toArray()).toEqual([
                { text: 'expect', offset: 13 },
                { text: 'splitCamelCaseWord', offset: 20 },
                { text: 'hello', offset: 40 },
                { text: 'to', offset: 49 },
                { text: 'deep', offset: 52 },
                { text: 'equal', offset: 57 },
                { text: 'hello', offset: 65 },
            ]);
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello'));
        `).toArray()).toEqual([
                { text: 'expect', offset: 13 },
                { text: 'splitCamelCaseWord', offset: 20 },
                { text: 'hello', offset: 40 },
            ]);
    });

    test('extract words from code', () => {
        expect(Text.extractWordsFromCode(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `).toArray()).toEqual([
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
        expect(Text.extractWordsFromCode(`
            expect(regExp.match(first_line));
        `).toArray()).toEqual([
                { text: 'expect', offset: 13 },
                { text: 'reg', offset: 20 },
                { text: 'Exp', offset: 23 },
                { text: 'match', offset: 27 },
                { text: 'first', offset: 33 },
                { text: 'line', offset: 39 },
            ]);
        expect(Text.extractWordsFromCode(`
            expect(aHELLO);
        `).toArray()).toEqual([
                { text: 'expect', offset: 13 },
                { text: 'a', offset: 20 },
                { text: 'HELLO', offset: 21 },
            ]);
        expect(Text.extractWordsFromCode(`
            const x = 'shouldn\'t';
        `).toArray()).toEqual([
                { text: 'const', offset: 13 },
                { text: 'x', offset: 19 },
                { text: 'shouldn\'t', offset: 24 },
            ]);
    });

    test('splits words like HTMLInput', () => {
        const words = Text.extractWordsFromCode('var value = HTMLInput.value;')
            .map(({text}) => text)
            .toArray();
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
        expect(Text.extractWordsFromCode(`
            <a href="http://www.ctrip.com" title="携程旅行网">携程旅行网</a>
        `).map(wo => wo.text).toArray()).toEqual(['a', 'href', 'http', 'www', 'ctrip', 'com', 'title', 'a']);
    });

    test('tests skipping Japanese characters', () => {
        expect(Text.extractWordsFromCode(`
            Example text: gitのpackageのみ際インストール
            gitのpackageのみ際インストール
            title="携程旅行网"
        `).map(wo => wo.text).toArray()).toEqual(['Example', 'text', 'git', 'package', 'git', 'package', 'title']);
    });

    test('tests Greek characters', () => {
        expect(Text.extractWordsFromCode(`
            Γ γ	gamma, γάμμα
        `).map(wo => wo.text).toArray()).toEqual(['Γ', 'γ', 'gamma', 'γάμμα']);
    });

    test('test case of Chinese characters', () => {
        expect(Text.isUpperCase('携程旅行网')).toBe(false);
        expect(Text.isLowerCase('携程旅行网')).toBe(false);
    });

    test('tests breaking up text into lines', () => {
        const parts = [
            '',
            '/*',
            ' * this is a comment.\r',
            ' */',
            '',
        ];
        const sampleText = parts.join('\n');
        const r = Text.extractLinesOfText(sampleText).map(a => a.text).toArray();
        expect(r.join('')).toBe(parts.join('\n'));
        const lines = [...Text.extractLinesOfText(sampleCode)].map(m => m.text);
        expect(lines.length).toBe(sampleCode.split('\n').length);
    });

    test('tests breaking up text into lines (single line)', () => {
        const parts = ['There is only one line.'];
        const sampleText = parts.join('\n');
        const r = Text.extractLinesOfText(sampleText).map(a => a.text).toArray();
        const rText = r.join('');
        expect(rText).toBe(parts.join('\n'));
        expect(rText).toBe(sampleText);
    });

    test('tests extractLinesOfText', () => {
        const linesA = [...Text.extractLinesOfText(sampleCode)].map(m => m.text);
        const linesB = Text.extractLinesOfText(sampleCode)
            .map(m => m.text)
            .toArray();
        expect(linesB).toEqual(linesA);
    });

    test('test extractText', () => {
        const line = Text.textOffset('This is a line of text to be processed.');
        const words = Text.extractWordsFromTextOffset(line);
        const results = words.map(wo => Text.extractText(line, wo.offset, wo.offset + wo.text.length)).toArray();
        const expected = words.map(wo => wo.text).toArray();
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


describe('Validates offset conversions', () => {
    function* getOffsets(haystack: string, needle: string) {
        let offset = -1;
        do {
            offset = haystack.indexOf(needle, offset + 1);
            if (offset > 0) {
                yield { offset, text: needle } as Text.TextOffset;
            } else {
                break;
            }
        } while (true);
    }

    test('calculateTextDocumentOffsets', () => {
        const offsets = [...getOffsets(sampleCode, 'const')];
        const results = Text.calculateTextDocumentOffsets('uri', sampleCode, offsets);
        expect(Object.keys(results)).not.toHaveLength(0);
        expect(results[0].row).toBe(6);
        expect(results[0].doc).toBe(sampleCode);
        expect(results[0].col).toBe(1);
    });
});

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
const unicodeHexValue2 = '\\x\{abcd\}';

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

const string1 = 'This is a single quote string.  it\'s a lot of fun.'
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
