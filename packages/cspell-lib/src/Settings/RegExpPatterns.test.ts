import type { TextOffset } from '@cspell/cspell-types';
import fs from 'fs';
import Path from 'path';
import { calculateTextDocumentOffsets } from '../util/text';
import * as TextRange from '../util/TextRange';
import * as RegPat from './RegExpPatterns';
import { regExMatchCommonHexFormats, regExMatchUrls } from './RegExpPatterns';

const matchUrl = regExMatchUrls.source;
const matchHexValues = regExMatchCommonHexFormats.source;

describe('Validate InDocSettings', () => {
    test('tests regExSpellingGuardBlock', () => {
        const m1 = sampleCode2LF.match(RegPat.regExSpellingGuardBlock);
        expect(m1).not.toBeFalsy();
        // cspell:disable
        expect(m1).toEqual([
            "spell-checker:disable\nconst unicodeHexValue = '\\uBABC';\nconst unicodeHexValue2 = '\\x{abcd}';\n\n// spell-checker:enable",
            'spell-checker:disable */\n\n// nested disabled checker is not supported.\n\n// spell-checker:disable\n\n// nested spell-checker:enable',
            'cSpell:disable\n\nNot checked.\n\n',
        ]);
        // cspell:enable
    });

    test('tests regExSpellingGuardBlock CRLF', () => {
        const m1 = sampleCode2CRLF.match(RegPat.regExSpellingGuardBlock);
        expect(m1).not.toBeFalsy();
        // cspell:disable
        expect(m1).toEqual(
            [
                "spell-checker:disable\nconst unicodeHexValue = '\\uBABC';\nconst unicodeHexValue2 = '\\x{abcd}';\n\n// spell-checker:enable",
                'spell-checker:disable */\n\n// nested disabled checker is not supported.\n\n// spell-checker:disable\n\n// nested spell-checker:enable',
                'cSpell:disable\n\nNot checked.\n\n',
            ].map((a) => a.replace(/\n/g, '\r\n'))
        );
        // cspell:enable
    });

    test('tests regExSpellingGuardLine', () => {
        const m1 = sampleCode2LF.match(RegPat.regExSpellingGuardLine);
        expect(m1).not.toBeFalsy();
        // cspell:disable
        expect(m1).toEqual(["const badspelling = 'disable'; // spell-checker:disable-line, yes all of it."]);
        // cspell:enable
    });

    test('tests regExSpellingGuardLine CRLF', () => {
        const m1 = sampleCode2CRLF.match(RegPat.regExSpellingGuardLine);
        expect(m1).not.toBeFalsy();
        // cspell:disable
        expect(m1).toEqual(
            ["const badspelling = 'disable'; // spell-checker:disable-line, yes all of it."].map((a) =>
                a.replace(/\n/g, '\r\n')
            )
        );
        // cspell:enable
    });

    test('tests regExSpellingGuardNext', () => {
        const m1 = sampleCode2LF.match(RegPat.regExSpellingGuardNext);
        expect(m1).not.toBeFalsy();
        // cspell:disable
        expect(m1).toEqual(["cspell:disable-next\nconst verybadspelling = 'disable';"]);
        // cspell:enable
    });

    test('tests regExSpellingGuardNext CRLF', () => {
        const m1 = sampleCode2CRLF.match(RegPat.regExSpellingGuardNext);
        expect(m1).not.toBeFalsy();
        // cspell:disable
        expect(m1).toEqual(
            ["cspell:disable-next\nconst verybadspelling = 'disable';"].map((a) => a.replace(/\n/g, '\r\n'))
        );
        // cspell:enable
    });

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

    test.each`
        str                         | expected      | comment
        ${''}                       | ${undefined}  | ${''}
        ${'hello'}                  | ${undefined}  | ${''}
        ${'commit 60975ea j'}       | ${'60975ea'}  | ${''}
        ${'commit c0ffee j'}        | ${undefined}  | ${'not long enough'}
        ${'commit c00ffee j'}       | ${'c00ffee'}  | ${''}
        ${'commit feeeeed j'}       | ${undefined}  | ${'does not contain any digits'}
        ${'commit feeeeed1 j'}      | ${'feeeeed1'} | ${''}
        ${'commit c00ffee 0baad j'} | ${'c00ffee'}  | ${'only the first one is matched'}
    `('regExCommitHash "$str" expect "$expected"', ({ str, expected }) => {
        const r = str.match(RegPat.regExCommitHash);
        expect(r?.[0]).toEqual(expected);
    });

    test.each`
        str                           | expected        | comment
        ${''}                         | ${undefined}    | ${''}
        ${'hello'}                    | ${undefined}    | ${''}
        ${'commit [60975ea] j'}       | ${'[60975ea]'}  | ${''}
        ${'commit [c0ffee] j'}        | ${undefined}    | ${'not long enough'}
        ${'commit [abcdef] j'}        | ${undefined}    | ${'not long enough'}
        ${'commit [abcdefg] j'}       | ${undefined}    | ${'contains non-hex digits'}
        ${'commit [c00ffee] j'}       | ${'[c00ffee]'}  | ${''}
        ${'commit [feeeeed] j'}       | ${'[feeeeed]'}  | ${'does not contain any digits'}
        ${'commit [feeeeed1] j'}      | ${'[feeeeed1]'} | ${''}
        ${'commit [c00ffee] 0baad j'} | ${'[c00ffee]'}  | ${'only the first one is matched'}
    `('regExCommitHashLink "$str" expect "$expected"', ({ str, expected }) => {
        const r = str.match(RegPat.regExCommitHashLink);
        expect(r?.[0]).toEqual(expected);
    });
    test.each`
        str                                      | expected
        ${''}                                    | ${undefined}
        ${'hello'}                               | ${undefined}
        ${'commit 0x60975ea j'}                  | ${'0x60975ea'}
        ${'only letters 0xfeed j'}               | ${'0xfeed'}
        ${'commit 0xfeeeeed1 j'}                 | ${'0xfeeeeed1'}
        ${'small value 0xf'}                     | ${'0xf'}
        ${'trailing _ messes stuff up 0xf_ '}    | ${undefined}
        ${'leading _ messes stuff up _0xf '}     | ${undefined}
        ${'leading digit does not match 10xf '}  | ${undefined}
        ${'leading letter does not match a0xf '} | ${undefined}
        ${'commit c00ffee 0x0baad j'}            | ${'0x0baad'}
    `('regExHexValue "$str" expect "$expected"', ({ str, expected }) => {
        const r = str.match(RegPat.regExCStyleHexValue);
        expect(r?.[0]).toEqual(expected);
    });

    test.each`
        str                                                          | expected
        ${''}                                                        | ${undefined}
        ${'hello'}                                                   | ${undefined}
        ${' -- "3dcdf935-d346-48cc-bdeb-fd9369192fec": 1413'}        | ${'3dcdf935-d346-48cc-bdeb-fd9369192fec'}
        ${'With placeholder X:XXXXXXXX-XXXX-1234-abcd-1234567890ab'} | ${'XXXXXXXX-XXXX-1234-abcd-1234567890ab'}
    `('regExUUID "$str" expect "$expected"', ({ str, expected }) => {
        const r = str.match(RegPat.regExUUID);
        expect(r?.[0]).toEqual(expected);
    });

    test.each`
        str                                                    | expected
        ${''}                                                  | ${undefined}
        ${'hello'}                                             | ${undefined}
        ${'simple U+200d, U+203c'}                             | ${'U+200d'}
        ${'range U+fa90-1fa95, U+1fa96-1fffd, U+200d, U+203c'} | ${'U+fa90-1fa95'}
        ${'extended ranage U+1fa96-1fffd, U+200d, U+203c'}     | ${'U+1fa96-1fffd'}
        ${'extended U+1fa9d,'}                                 | ${'U+1fa9d'}
        ${'junk U+200h, '}                                     | ${undefined}
    `('regExUnicodeRef "$str" expect "$expected"', ({ str, expected }) => {
        const r = str.match(RegPat.regExUnicodeRef);
        expect(r?.[0]).toEqual(expected);
    });

    test.each`
        str                                | expected
        ${''}                              | ${undefined}
        ${'hello'}                         | ${undefined}
        ${'background-color: #fffedb;'}    | ${'#fffedb'}
        ${'background-color: #fffedbff;'}  | ${'#fffedbff'}
        ${'background-color: #0fffedbff;'} | ${undefined}
        ${'background: #a2afbc;'}          | ${'#a2afbc'}
        ${'color: #aaa'}                   | ${'#aaa'}
        ${'color: #ff'}                    | ${undefined}
    `('regExCSSHexValue "$str" expect "$expected"', ({ str, expected }) => {
        const r = str.match(RegPat.regExCSSHexValue);
        expect(r?.[0]).toEqual(expected);
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

    test('matching urls', () => {
        RegPat.regExMatchUrls.lastIndex = 22;
        const reg = new RegExp(RegPat.regExMatchUrls);
        expect(reg.lastIndex).toBe(0);
        const text = `
            <p>
                some <b>bold</b> <i class='example'>text</i>
                <a href="http://example.org">link to example</a>
                <a href="/example/">another link</a>
            </p>
        `;
        const matches = text.match(reg);
        expect(matches).not.toBeNull();
        expect(matches).toHaveLength(1);
        expect(matches?.[0]).toBe('http://example.org');
    });

    test('matching href', () => {
        const reg = new RegExp(RegPat.regExHRef);
        const text = `
            <p>
                some <b>bold</b> <i class='example'>text</i>
                <a href="http://example.org">link to example</a>
                <a href="/example/">another link</a>
            </p>
        `;
        const matches = text.match(reg);
        expect(matches).not.toBeNull();
        expect(matches).toHaveLength(2);
        expect(matches?.[0]).toBe('href="http://example.org"');
        expect(matches?.[1]).toBe('href="/example/"');
    });

    test('sha regex', () => {
        RegPat.regExHashStrings.lastIndex = 0;
        expect(RegPat.regExHashStrings.test('')).toBe(false);
        RegPat.regExHashStrings.lastIndex = 0;
        expect(
            RegPat.regExHashStrings.test(
                'sha512-mm6iZYQ1xbVBNsWq2VSMFuneRuO0k0wUqIT4ZfrtbD1Eb90DXmqBOPA/URyUHq6wsftxr8aXDJHTTHyyBBY95w=='
            )
        ).toBe(true);
        RegPat.regExHashStrings.lastIndex = 0;
        expect(
            RegPat.regExHashStrings.test(
                'sha512-vjiRZkhKEyZndtFOz/FtIp0CqPbgOOki8o9IcPOLTqlzcnvFLToYdERshLaI6TCz7pDWoKlmvgftqB4xlltn9g=='
            )
        ).toBe(true);
        RegPat.regExHashStrings.lastIndex = 0;
        expect(RegPat.regExHashStrings.test('sha1-RBT/dKUIecII7l/cgm4ywwNUnto=')).toBe(true);
        RegPat.regExHashStrings.lastIndex = 0;
    });

    test('regExCert', () => {
        RegPat.regExCert.lastIndex = 0;
        const match = sampleCert.match(RegPat.regExCert);
        expect(match).toHaveLength(3);
        expect(nonCert.match(RegPat.regExCert)).toBeNull();
    });

    test('regExPublicKey', () => {
        RegPat.regExCert.lastIndex = 0;
        const match = sampleCert.match(RegPat.regExPublicKey);
        expect(match).toHaveLength(1);
        expect(nonCert.match(RegPat.regExPublicKey)).toBeNull();
    });

    test('regExIgnoreSpellingDirectives', () => {
        const match = sampleBug345.match(RegPat.regExIgnoreSpellingDirectives);
        expect(match?.[0]).toBe('cspell\x3AignoreRegExp "(foobar|foobaz)"');
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

const nonCert = `
if [[ "\${tmp}" = *"-----BEGIN CERTIFICATE-----"* ]]; then
echo "\${certText}" | grep -A 1 "Subject Alternative Name:" \
    | sed -e "2s/DNS://g" -e "s/ //g" | tr "," "\n" | tail -n +2;
fi;
`;

const sampleCert = `
-----BEGIN RSA PRIVATE KEY-----
izfrNTmQLnfsLzi2Wb9xPz2Qj9fQYGgeug3N2MkDuVHwpPcgkhHkJgCQuuvT+qZI
MbS2U6wTS24SZk5RunJIUkitRKeWWMS28SLGfkDs1bBYlSPa5smAd3/q1OePi4ae
dU6YgWuDxzBAKEKVSUu6pA2HOdyQ9N4F1dI+F8w9J990zE93EgyNqZFBBa2L70h4
M7DrB0gJBWMdUMoxGnun5glLiCMo2JrHZ9RkMiallS1sHMhELx2UAlP8I1+0Mav8
iMlHGyUW8EJy0paVf09MPpceEcVwDBeX0+G4UQlO551GTFtOSRjcD8U+GkCzka9W
/SFQrSGe3Gh3SDaOw/4JEMAjWPDLiCglwh0rLIO4VwU6AxzTCuCw3d1ZxQsU6VFQ
PqHA8haOUATZIrp3886PBThVqALBk9p1Nqn51bXLh13Zy9DZIVx4Z5Ioz/EGuzgR
d68VW5wybLjYE2r6Q9nHpitSZ4ZderwjIZRes67HdxYFw8unm4Wo6kuGnb5jSSag
8S86b6zEmkser+SDYgGketS2DZ4hB+vh2ujSXmS8Gkwrn+BfHMzkbtio8lWbGw0l
eM1tfdFZ6wMTLkxRhBkBK4JiMiUMvpERyPib6a2L6iXTfH+3RUDS6A==
-----END RSA PRIVATE KEY-----

-----BEGIN RSA PUBLIC KEY-----
izfrNTmQLnfsLzi2Wb9xPz2Qj9fQYGgeug3N2MkDuVHwpPcgkhHkJgCQuuvT+qZI
MbS2U6wTS24SZk5RunJIUkitRKeWWMS28SLGfkDs1bBYlSPa5smAd3/q1OePi4ae
dU6YgWuDxzBAKEKVSUu6pA2HOdyQ9N4F1dI+F8w9J990zE93EgyNqZFBBa2L70h4
M7DrB0gJBWMdUMoxGnun5glLiCMo2JrHZ9RkMiallS1sHMhELx2UAlP8I1+0Mav8
iMlHGyUW8EJy0paVf09MPpceEcVwDBeX0+G4UQlO551GTFtOSRjcD8U+GkCzka9W
/SFQrSGe3Gh3SDaOw/4JEMAjWPDLiCglwh0rLIO4VwU6AxzTCuCw3d1ZxQsU6VFQ
PqHA8haOUATZIrp3886PBThVqALBk9p1Nqn51bXLh13Zy9DZIVx4Z5Ioz/EGuzgR
d68VW5wybLjYE2r6Q9nHpitSZ4ZderwjIZRes67HdxYFw8unm4Wo6kuGnb5jSSag
8S86b6zEmkser+SDYgGketS2DZ4hB+vh2ujSXmS8Gkwrn+BfHMzkbtio8lWbGw0l
eM1tfdFZ6wMTLkxRhBkBK4JiMiUMvpERyPib6a2L6iXTfH+3RUDS6A==
-----END RSA PUBLIC KEY-----

-----BEGIN CERTIFICATE-----
MIICMzCCAZygAwIBAgIJALiPnVsvq8dsMA0GCSqGSIb3DQEBBQUAMFMxCzAJBgNV
BAYTAlVTMQwwCgYDVQQIEwNmb28xDDAKBgNVBAcTA2ZvbzEMMAoGA1UEChMDZm9v
OveIHyc0E0KIbhjK5FkCBU4CiZrbfHagaW7ZEcN0tt3EvpbOMxxc/ZQU2WN/s/wP
xph0pSfsfFsTKM4RhTWD2v4fgk+xZiKd1p0+L4hTtpwnEw0uXRVd0ki6muwV5y/P
+5FHUeldq+pgTcgzuK8CAwEAAaMPMA0wCwYDVR0PBAQDAgLkMA0GCSqGSIb3DQEB
BQUAA4GBAJiDAAtY0mQQeuxWdzLRzXmjvdSuL9GoyT3BF/jSnpxz5/58dba8pWen
v3pj4P3w5DoOso0rzkZy2jEsEitlVM2mLSbQpMM+MUVQCQoiG6W9xuCFuxSrwPIS
pAqEAuV4DNoxQKKWmhVv+J0ptMWD25Pnpxeq5sXzghfJnslJlQND
-----END CERTIFICATE-----
`;

const sampleCode2LF = sampleCodeSrc.replace(/\r?\n/g, '\n');
const sampleCode2CRLF = sampleCode2LF.replace(/\n/g, '\r\n');

const sampleBug345 = fs.readFileSync(Path.join(__dirname, '../../samples/bug-fixes/bug345.ts'), 'utf-8');
