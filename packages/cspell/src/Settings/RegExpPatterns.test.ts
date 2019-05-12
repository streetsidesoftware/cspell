import { expect } from 'chai';
import * as TextRange from '../util/TextRange';
import { regExMatchUrls, regExMatchCommonHexFormats } from './RegExpPatterns';
import * as RegPat from './RegExpPatterns';

const matchUrl = regExMatchUrls.source;
const matchHexValues = regExMatchCommonHexFormats.source;

describe('Validate InDocSettings', () => {

    it('tests regExSpellingGuard', () => {
        const m1 = sampleCode2.match(RegPat.regExSpellingGuard);
        expect(m1).is.not.empty;
        expect(m1).has.length(5);
        // cspell:disable
        expect(m1).is.deep.equal([
            "const badspelling = 'disable'; // spell-checker:disable-line, yes all of it.",
            "cspell:disable-next\nconst verybadspelling = 'disable';\n",
            "spell-checker:disable\nconst unicodeHexValue = '\\uBABC';\nconst unicodeHexValue2 = '\\x{abcd}';\n\n// spell-checker:enable",
            'spell-checker:disable */\n\n// nested disabled checker is not supported.\n\n// spell-checker:disable\n\n// nested spell-checker:enable',
            'cSpell:disable\n\nNot checked.\n\n',
        ]);
        // cspell:enable
    });

    it('tests finding a set of matching positions', () => {
        const text = sampleCode2;
        const ranges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExMatchUrls,
            RegPat.regExSpellingGuard,
            RegPat.regExMatchCommonHexFormats,
        ], text);
        expect(ranges.length).to.be.equal(10);
    });

    it('tests merging inclusion and exclusion patterns into an inclusion list', () => {
        const text = sampleCode2;
        const includeRanges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExString,
            RegPat.regExPhpHereDoc,
            RegPat.regExCStyleComments,
        ], text);
        const excludeRanges = TextRange.findMatchingRangesForPatterns([
            RegPat.regExSpellingGuard,
            RegPat.regExMatchUrls,
            RegPat.regExMatchCommonHexFormats,
        ], text);
        const mergedRanges = TextRange.excludeRanges(includeRanges, excludeRanges);
        expect(mergedRanges.length).to.be.equal(24);
    });

    it('test for hex values', () => {
        expect(RegPat.regExHexDigits.test('FFEE')).to.be.true;
    });

    it('tests finding matching positions', () => {
        const text = sampleCode2;
        const urls = TextRange.findMatchingRanges(matchUrl, text);
        expect(urls.length).equals(2);

        const hexRanges = TextRange.findMatchingRanges(matchHexValues, text);
        expect(hexRanges.length).to.be.equal(5);
        expect(hexRanges[2].startPos).to.be.equal(text.indexOf('0xbadc0ffee'));

        const disableChecker = TextRange.findMatchingRanges(RegPat.regExSpellingGuard, text);
        expect(disableChecker.length).to.be.equal(5);

        const hereDocs = TextRange.findMatchingRanges(RegPat.regExPhpHereDoc, text);
        expect(hereDocs.length).to.be.equal(3);

        const strings = TextRange.findMatchingRanges(RegPat.regExString, text);
        expect(strings.length).to.be.equal(14);
    });

    it('test matching urls', () => {
        RegPat.regExMatchUrls.lastIndex = 22;
        const reg = new RegExp(RegPat.regExMatchUrls);
        expect(reg.lastIndex).to.be.eq(0);
        const text = `
            <p>
                some <b>bold</b> <i class='example'>text</i>
                <a href="http://example.org">link to example</a>
                <a href="/example/">another link</a>
            </p>
        `;
        const matches = text.match(reg);
        expect(matches).to.be.not.null;
        expect(matches).to.have.length(1);
        expect(matches![0]).to.be.equal('http://example.org');
    });

    it('test matching href', () => {
        const reg = new RegExp(RegPat.regExHRef);
        const text = `
            <p>
                some <b>bold</b> <i class='example'>text</i>
                <a href="http://example.org">link to example</a>
                <a href="/example/">another link</a>
            </p>
        `;
        const matches = text.match(reg);
        expect(matches).to.be.not.null;
        expect(matches).to.have.length(2);
        expect(matches![0]).to.be.equal('href="http://example.org"');
        expect(matches![1]).to.be.equal('href="/example/"');
    });

    it('test sha regex', () => {
        RegPat.regExSha.lastIndex = 0;
        expect(RegPat.regExSha.test('')).to.be.false;
        RegPat.regExSha.lastIndex = 0;
        expect(RegPat.regExSha.test('sha512-mm6iZYQ1xbVBNsWq2VSMFuneRuO0k0wUqIT4ZfrtbD1Eb90DXmqBOPA/URyUHq6wsftxr8aXDJHTTHyyBBY95w==')).to.be.true;
        RegPat.regExSha.lastIndex = 0;
        expect(RegPat.regExSha.test('sha512-vjiRZkhKEyZndtFOz/FtIp0CqPbgOOki8o9IcPOLTqlzcnvFLToYdERshLaI6TCz7pDWoKlmvgftqB4xlltn9g==')).to.be.true;
        RegPat.regExSha.lastIndex = 0;
        expect(RegPat.regExSha.test('sha1-RBT/dKUIecII7l/cgm4ywwNUnto=')).to.be.true;
        RegPat.regExSha.lastIndex = 0;
    });
});

const sampleCode2 = `
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
