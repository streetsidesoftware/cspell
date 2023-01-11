import type { TextOffset } from '@cspell/cspell-types';

import * as RegPat from '../Settings/RegExpPatterns';
import { regExMatchCommonHexFormats, regExMatchUrls } from '../Settings/RegExpPatterns';
import { calculateTextDocumentOffsets } from './text';
import * as TextRange from './TextRange';

const matchUrl = regExMatchUrls;
const matchHexValues = regExMatchCommonHexFormats;

describe('Validate Text Ranges using Regexp', () => {
    test('tests finding a set of matching positions', () => {
        const text = sampleCode2LF;
        const ranges = TextRange.findMatchingRangesForPatterns(
            [
                RegPat.regExMatchUrls,
                RegPat.regExSpellingGuardBlock,
                RegPat.regExSpellingGuardLine,
                RegPat.regExSpellingGuardNext,
                RegPat.regExMatchCommonHexFormats,
            ],
            text
        );
        expect(rangesToText(text, ranges)).toEqual([
            "  7: 14 https://www.google.com?q=typescript';",
            "  8: 15 http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe';",
            '  9: 22 #cccd',
            ' 10: 19 0x5612abcd',
            ' 11: 28 0xbadc0ffee',
            " 13:  1 const badspelling = 'disable'; // spell-checker:disable-line, yes all of it.",
            " 15:  4 cspell:disable-next\nconst verybadspelling = 'disable';",
            " 19:  4 spell-checker:disable\nconst unicodeHexValue = '\\uBABC';\nconst unicodeHexValue2 = '\\x{abcd}';\n\n// spell-checker:enable",
            ' 29:  4 spell-checker:disable */\n\n// nested disabled checker is not supported.\n\n// spell-checker:disable\n\n// nested spell-checker:enable',
            ' 67:  4 cSpell:disable\n\nNot checked.\n\n',
        ]);
    });

    test('tests finding a set of matching positions CRLF', () => {
        const text = sampleCode2CRLF;
        const ranges = TextRange.findMatchingRangesForPatterns(
            [
                RegPat.regExMatchUrls,
                RegPat.regExSpellingGuardBlock,
                RegPat.regExSpellingGuardLine,
                RegPat.regExSpellingGuardNext,
                RegPat.regExMatchCommonHexFormats,
            ],
            text
        );
        expect(rangesToText(text, ranges)).toEqual([
            "  7: 14 https://www.google.com?q=typescript';",
            "  8: 15 http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe';",
            '  9: 22 #cccd',
            ' 10: 19 0x5612abcd',
            ' 11: 28 0xbadc0ffee',
            " 13:  1 const badspelling = 'disable'; // spell-checker:disable-line, yes all of it.",
            " 15:  4 cspell:disable-next\r\nconst verybadspelling = 'disable';",
            " 19:  4 spell-checker:disable\r\nconst unicodeHexValue = '\\uBABC';\r\nconst unicodeHexValue2 = '\\x{abcd}';\r\n\r\n// spell-checker:enable",
            ' 29:  4 spell-checker:disable */\r\n\r\n// nested disabled checker is not supported.\r\n\r\n' +
                '// spell-checker:disable\r\n\r\n// nested spell-checker:enable',
            ' 67:  4 cSpell:disable\r\n\r\nNot checked.\r\n\r\n',
        ]);
    });

    test('tests merging inclusion and exclusion patterns into an inclusion list', () => {
        const text = sampleCode2LF;
        const includeRanges = TextRange.findMatchingRangesForPatterns(
            [RegPat.regExString, RegPat.regExPhpHereDoc, RegPat.regExCStyleComments],
            text
        );
        const excludeRanges = TextRange.findMatchingRangesForPatterns(
            [
                RegPat.regExSpellingGuardBlock,
                RegPat.regExSpellingGuardLine,
                RegPat.regExSpellingGuardNext,
                RegPat.regExMatchUrls,
                RegPat.regExMatchCommonHexFormats,
            ],
            text
        );
        const mergedRanges = TextRange.excludeRanges(includeRanges, excludeRanges);
        expect(rangesToText(text, mergedRanges)).toEqual([
            '  2:  1 /*\n * this is a comment.\n */',
            "  6: 14 'some nice text goes here'",
            "  7: 13 '",
            "  8: 14 '",
            "  9: 21 '",
            "  9: 27 '",
            ' 14:  1 // But not this line',
            ' 15:  1 // ',
            ' 17:  1 // And not this line',
            ' 19:  1 // ',
            ' 25:  1 /* More code and comments */',
            ' 27:  1 // Make sure /* this works.',
            ' 29:  1 /* ',
            ' 35: 31  <--> checking is now turned on.',
            ' 37:  1 // This will be checked',
            ' 39:  1 /*\n * spell-checker:enable  <-- this makes no difference because it was already turned back on.\n */',
            " 43: 12 ''",
            " 45: 13 ' '",
            " 48: 17 'This is a single quote string.  it\\'s a lot of fun.'",
            ' 49: 17 "How about a double quote string?"',
            ' 50: 24 `\ncan contain " and \'\n\n `',
            ' 55: 21 <<<SQL\n    SELECT * FROM users WHERE id in :ids;\nSQL;',
            ' 59: 21 <<<"SQL"\n    SELECT * FROM users WHERE id in :ids;\nSQL;',
            " 63: 20 <<<'SQL'\n    SELECT * FROM users WHERE id in :ids;\nSQL;",
            ' 67:  1 // ',
        ]);
    });

    test('tests merging inclusion and exclusion patterns into an inclusion list CRLF', () => {
        const text = sampleCode2CRLF;
        const includeRanges = TextRange.findMatchingRangesForPatterns(
            [RegPat.regExString, RegPat.regExPhpHereDoc, RegPat.regExCStyleComments],
            text
        );
        const excludeRanges = TextRange.findMatchingRangesForPatterns(
            [
                RegPat.regExSpellingGuardBlock,
                RegPat.regExSpellingGuardLine,
                RegPat.regExSpellingGuardNext,
                RegPat.regExMatchUrls,
                RegPat.regExMatchCommonHexFormats,
            ],
            text
        );
        const mergedRanges = TextRange.excludeRanges(includeRanges, excludeRanges);
        expect(rangesToText(text, mergedRanges)).toEqual([
            '  2:  1 /*\r\n * this is a comment.\r\n */',
            "  6: 14 'some nice text goes here'",
            "  7: 13 '",
            "  8: 14 '",
            "  9: 21 '",
            "  9: 27 '",
            ' 14:  1 // But not this line',
            ' 15:  1 // ',
            ' 17:  1 // And not this line',
            ' 19:  1 // ',
            ' 25:  1 /* More code and comments */',
            ' 27:  1 // Make sure /* this works.',
            ' 29:  1 /* ',
            ' 35: 31  <--> checking is now turned on.',
            ' 37:  1 // This will be checked',
            ' 39:  1 /*\r\n * spell-checker:enable  <-- this makes no difference because it was already turned back on.\r\n */',
            " 43: 12 ''",
            " 45: 13 ' '",
            " 48: 17 'This is a single quote string.  it\\'s a lot of fun.'",
            ' 49: 17 "How about a double quote string?"',
            ' 50: 24 `\r\ncan contain " and \'\r\n\r\n `',
            ' 55: 21 <<<SQL\r\n    SELECT * FROM users WHERE id in :ids;\r\nSQL;',
            ' 59: 21 <<<"SQL"\r\n    SELECT * FROM users WHERE id in :ids;\r\nSQL;',
            " 63: 20 <<<'SQL'\r\n    SELECT * FROM users WHERE id in :ids;\r\nSQL;",
            ' 67:  1 // ',
        ]);
    });

    test('tests finding matching positions', () => {
        const text = sampleCode2LF;
        const urls = TextRange.findMatchingRanges(matchUrl, text);
        expect(urls.length).toBe(2);

        const hexRanges = TextRange.findMatchingRanges(matchHexValues, text);
        expect(hexRanges.length).toBe(5);
        expect(hexRanges[2].startPos).toBe(text.indexOf('0xbadc0ffee'));

        const disableChecker = TextRange.findMatchingRangesForPatterns(
            [RegPat.regExSpellingGuardBlock, RegPat.regExSpellingGuardLine, RegPat.regExSpellingGuardNext],
            text
        );
        expect(disableChecker.length).toBe(5);

        const hereDocs = TextRange.findMatchingRanges(RegPat.regExPhpHereDoc, text);
        expect(hereDocs.length).toBe(3);

        const ranges = TextRange.findMatchingRanges(RegPat.regExString, text);
        expect(rangesToText(text, ranges)).toEqual([
            "  6: 14 'some nice text goes here'",
            "  7: 13 'https://www.google.com?q=typescript'",
            "  8: 14 'http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe'",
            "  9: 21 '#cccd'",
            " 13: 21 'disable'",
            " 16: 25 'disable'",
            " 20: 25 '\\uBABC'",
            " 21: 26 '\\x{abcd}'",
            " 43: 12 ''",
            " 45: 13 ' '",
            " 48: 17 'This is a single quote string.  it\\'s a lot of fun.'",
            ' 49: 17 "How about a double quote string?"',
            ' 50: 24 `\ncan contain " and \'\n\n `',
            ' 59: 24 "SQL"',
            " 63: 23 'SQL'",
        ]);
    });

    test('tests finding matching positions CRLF', () => {
        const text = sampleCode2CRLF;
        const urls = TextRange.findMatchingRanges(matchUrl, text);
        expect(urls.length).toBe(2);

        const hexRanges = TextRange.findMatchingRanges(matchHexValues, text);
        expect(hexRanges.length).toBe(5);
        expect(hexRanges[2].startPos).toBe(text.indexOf('0xbadc0ffee'));

        const disableChecker = TextRange.findMatchingRangesForPatterns(
            [RegPat.regExSpellingGuardBlock, RegPat.regExSpellingGuardLine, RegPat.regExSpellingGuardNext],
            text
        );
        expect(disableChecker.length).toBe(5);

        const hereDocs = TextRange.findMatchingRanges(RegPat.regExPhpHereDoc, text);
        expect(hereDocs.length).toBe(3);

        const ranges = TextRange.findMatchingRanges(RegPat.regExString, text);
        expect(rangesToText(text, ranges)).toEqual([
            "  6: 14 'some nice text goes here'",
            "  7: 13 'https://www.google.com?q=typescript'",
            "  8: 14 'http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe'",
            "  9: 21 '#cccd'",
            " 13: 21 'disable'",
            " 16: 25 'disable'",
            " 20: 25 '\\uBABC'",
            " 21: 26 '\\x{abcd}'",
            " 43: 12 ''",
            " 45: 13 ' '",
            " 48: 17 'This is a single quote string.  it\\'s a lot of fun.'",
            ' 49: 17 "How about a double quote string?"',
            ' 50: 24 `\r\ncan contain " and \'\r\n\r\n `',
            ' 59: 24 "SQL"',
            " 63: 23 'SQL'",
        ]);
    });
});

function rangesToText(text: string, ranges: TextRange.MatchRange[]): string[] {
    const textOffsets: TextOffset[] = TextRange.extractRangeText(text, ranges).map((r) => ({
        offset: r.startPos,
        text: r.text,
    }));
    const offsets = calculateTextDocumentOffsets('', text, textOffsets);
    return offsets.map((t) => `${t.row.toString().padStart(3)}:${t.col.toString().padStart(3)} ${t.text}`);
}

const sampleCodeSrc = `
/*
 * this is a comment.\r
 */

const text = 'some nice text goes here';
const url = 'https://www.google.com?q=typescript';
const url2 = 'http://www.weirddomain.com?key=jdhehdjsiijdkejshaijncjfhe';
const cssHexValue = '#cccd';
const cHexValue = 0x5612abcd;
const cHexValueBadCoffee = 0xbadc0ffee;

const badspelling = 'disable'; // spell-checker:disable-line, yes all of it.
// But not this line
// cspell:disable-next
const verybadspelling = 'disable';
// And not this line

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

const sampleCode2LF = sampleCodeSrc.replace(/\r?\n/g, '\n');
const sampleCode2CRLF = sampleCode2LF.replace(/\n/g, '\r\n');
