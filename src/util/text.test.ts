import { splitCamelCaseWord } from './text';
import * as Text from './text';
import { expect } from 'chai';

// cSpell:ignore Ápple DBAs ctrip γάμμα

describe('Util Text', () => {
    it('tests build regexp from string', () => {
        const regEx1 = Text.stringToRegExp('');
        expect(regEx1).to.be.undefined;
        const regEx2 = Text.stringToRegExp('a');
        expect(regEx2!.toString()).to.be.equal('/a/gim');
        const regEx3 = Text.stringToRegExp('/');
        expect(regEx3).not.to.be.undefined;
        expect(regEx3!.toString()).to.be.equal('/\\//gim');
        const regEx4 = Text.stringToRegExp(/abc/);
        expect(regEx4!.toString()).to.be.equal('/abc/');
    });

    it('splits words', () => {
        expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        expect(splitCamelCaseWord('helloThere')).to.deep.equal(['hello', 'There']);
        expect(splitCamelCaseWord('HelloThere')).to.deep.equal(['Hello', 'There']);
        expect(splitCamelCaseWord('BigÁpple')).to.deep.equal(['Big', 'Ápple']);
        expect(splitCamelCaseWord('ASCIIToUTF16')).to.deep.equal(['ASCII', 'To', 'UTF16']);
        expect(splitCamelCaseWord('URLsAndDBAs')).to.deep.equal(['Urls', 'And', 'Dbas']);
        expect(splitCamelCaseWord('WALKingRUNning')).to.deep.equal(['Walking', 'Running']);
    });

    it('extract word from text', () => {
        expect(Text.extractWordsFromText(`
            // could've, would've, couldn't've, wasn't, y'all, 'twas, shouldn’t
        `).toArray()).to.deep.equal([
                { text: "could've", offset: 16 },
                { text: "would've", offset: 26 },
                { text: "couldn't've", offset: 36 },
                { text: "wasn't", offset: 49 },
                { text: "y'all", offset: 57 },
                { text: 'twas', offset: 65 },
                { text: 'shouldn’t', offset: 71 },
            ]);
    });

    it('extract words', () => {
        expect(Text.extractWordsFromText(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `).toArray()).to.deep.equal([
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
        `).toArray()).to.deep.equal([
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
        `).toArray()).to.deep.equal([
                { text: 'expect', offset: 13 },
                { text: 'splitCamelCaseWord', offset: 20 },
                { text: 'hello', offset: 40 },
            ]);
    });

    it('extract words from code', () => {
        expect(Text.extractWordsFromCode(`
            expect(splitCamelCaseWord('hello')).to.deep.equal(['hello']);
        `).toArray()).to.deep.equal([
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
        `).toArray()).to.deep.equal([
                { text: 'expect', offset: 13 },
                { text: 'reg', offset: 20 },
                { text: 'Exp', offset: 23 },
                { text: 'match', offset: 27 },
                { text: 'first', offset: 33 },
                { text: 'line', offset: 39 },
            ]);
        expect(Text.extractWordsFromCode(`
            expect(aHELLO);
        `).toArray()).to.deep.equal([
                { text: 'expect', offset: 13 },
                { text: 'a', offset: 20 },
                { text: 'HELLO', offset: 21 },
            ]);
        expect(Text.extractWordsFromCode(`
            const x = 'shouldn\'t';
        `).toArray()).to.deep.equal([
                { text: 'const', offset: 13 },
                { text: 'x', offset: 19 },
                { text: 'shouldn\'t', offset: 24 },
            ]);
    });

    it('splits words like HTMLInput', () => {
        return Text.extractWordsFromCodeRx('var value = HTMLInput.value;')
            .map(({text}) => text)
            .toArray()
            .toPromise()
            .then(words => {
                expect(words).to.deep.equal(['var', 'value', 'HTML', 'Input', 'value']);
            });
    });

    it('tests matchCase', () => {
        expect(Text.matchCase('Apple', 'orange')).to.be.equal('Orange');
        expect(Text.matchCase('apple', 'ORANGE')).to.be.equal('orange');
        expect(Text.matchCase('apple', 'orange')).to.be.equal('orange');
        expect(Text.matchCase('APPLE', 'orange')).to.be.equal('ORANGE');
        expect(Text.matchCase('ApPlE', 'OrangE')).to.be.equal('OrangE');
        expect(Text.matchCase('apPlE', 'OrangE')).to.be.equal('orangE');
    });

    it('tests skipping Chinese characters', () => {
        expect(Text.extractWordsFromCode(`
            <a href="http://www.ctrip.com" title="携程旅行网">携程旅行网</a>
        `).map(wo => wo.text).toArray()).to.deep.equal(
            ['a', 'href', 'http', 'www', 'ctrip', 'com', 'title', 'a']
            );
    });

    it('tests Greek characters', () => {
        expect(Text.extractWordsFromCode(`
            Γ γ	gamma, γάμμα
        `).map(wo => wo.text).toArray()).to.deep.equal(
            ['Γ', 'γ', 'gamma', 'γάμμα']
            );
    });

    it('test case of Chinese characters', () => {
        expect(Text.isUpperCase('携程旅行网')).to.be.false;
        expect(Text.isLowerCase('携程旅行网')).to.be.false;
    });

    it('tests breaking up text into lines', () => {
        const parts = [
            '',
            '/*',
            ' * this is a comment.\r',
            ' */',
            '',
        ];
        const sampleText = parts.join('\n');
        const i = Text.extractLinesOfText(sampleText);
        const r = [
            i.next().value.text,
            i.next().value.text,
            i.next().value.text,
            i.next().value.text,
        ];
        expect(r.join('')).to.be.equal(parts.join('\n'));
        const lines = [...Text.extractLinesOfText(sampleCode)].map(m => m.text);
        expect(lines.length).to.be.equal(64);
    });

    it('tests extractLinesOfTextRx', () => {
        const linesA = [...Text.extractLinesOfText(sampleCode)].map(m => m.text);
        return Text.extractLinesOfTextRx(sampleCode)
            .map(m => m.text)
            .toArray()
            .toPromise()
            .then(linesB => {
                expect(linesB).to.be.deep.equal(linesA);
            });
    });
});

describe('Test the text matching functions', () => {
    it('isUpperCase', () => {
        expect(Text.isUpperCase('first')).to.be.false;
        expect(Text.isUpperCase('First')).to.be.false;
        expect(Text.isUpperCase('FIRST')).to.be.true;
    });
    it('isLowerCase', () => {
        expect(Text.isLowerCase('first')).to.be.true;
        expect(Text.isLowerCase('First')).to.be.false;
        expect(Text.isLowerCase('FIRST')).to.be.false;
    });
    it('isFirstCharacterUpper', () => {
        expect(Text.isFirstCharacterUpper('first')).to.be.false;
        expect(Text.isFirstCharacterUpper('First')).to.be.true;
        expect(Text.isFirstCharacterUpper('FIRST')).to.be.true;
    });
    it('isFirstCharacterLower', () => {
        expect(Text.isFirstCharacterLower('first')).to.be.true;
        expect(Text.isFirstCharacterLower('First')).to.be.false;
        expect(Text.isFirstCharacterLower('FIRST')).to.be.false;
    });
    // cSpell:ignore áello firstname
    it('ucFirst', () => {
        expect(Text.ucFirst('hello')).to.be.equal('Hello');
        expect(Text.ucFirst('Hello')).to.be.equal('Hello');
        expect(Text.ucFirst('áello')).to.be.equal('Áello');
    });
    it('lcFirst', () => {
        expect(Text.lcFirst('hello')).to.be.equal('hello');
        expect(Text.lcFirst('Hello')).to.be.equal('hello');
        expect(Text.lcFirst('áello')).to.be.equal('áello');
        expect(Text.lcFirst('Áello')).to.be.equal('áello');
    });
    it('snakeToCamel', () => {
        expect(Text.snakeToCamel('first')).to.be.equal('First');
        expect(Text.snakeToCamel('firstName')).to.be.equal('FirstName');
        expect(Text.snakeToCamel('first_name')).to.be.equal('FirstName');
        expect(Text.snakeToCamel('FIRST_NAME')).to.be.equal('FIRSTNAME');
    });
    it('camelToSnake', () => {
        expect(Text.camelToSnake('first')).to.be.equal('first');
        expect(Text.camelToSnake('firstName')).to.be.equal('first_name');
        expect(Text.camelToSnake('first_name')).to.be.equal('first_name');
        expect(Text.camelToSnake('FIRSTName')).to.be.equal('first_name');
        expect(Text.camelToSnake('FIRSTNAME')).to.be.equal('firstname');
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

    it('calculateTextDocumentOffsets', () => {
        const offsets = [...getOffsets(sampleCode, 'const')];
        const results = Text.calculateTextDocumentOffsets('uri', sampleCode, offsets);
        expect(results).to.not.be.empty;
        expect(results[0].row).to.be.equal(6);
        expect(results[0].doc).to.be.equal(sampleCode);
        expect(results[0].col).to.be.equal(1);
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
