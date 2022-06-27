import assert from 'assert';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createTextDocument, TextDocument } from '../Models/TextDocument';
import { AutoCache } from '../util/simpleCache';
import { DocumentValidator } from './docValidator';
import { ValidationIssue } from './validator';

const docCache = new AutoCache(_loadDoc, 100);
const fixturesDir = path.join(__dirname, '../../fixtures');

const oc = expect.objectContaining;
const ac = expect.arrayContaining;

describe('docValidator', () => {
    test('DocumentValidator', () => {
        const doc = td(__filename, '/** This is some code */');
        const dVal = new DocumentValidator(doc, {}, {});
        expect(dVal.document).toBe(doc);
        // dVal.prepareSync();
        // expect(dVal.checkText([0, 0], '', [])).toEqual([]);
    });

    test.each`
        filename
        ${__filename}
        ${path.join(__dirname, '../../package.json')}
    `('DocumentValidator prepare $filename', async ({ filename }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, {}, {});
        expect(dVal.ready).toBe(false);
        await expect(dVal.prepare()).resolves.toBeUndefined();
        expect(dVal.ready).toBe(true);
    });

    // cspell:ignore Helllo grrrr dockblock

    test.each`
        filename                                   | startText       | endText      | expected
        ${__filename}                              | ${'__filename'} | ${undefined} | ${[]}
        ${fix('sample-with-errors.ts')}            | ${"'H"}         | ${"'"}       | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'/**'}        | ${'*/'}      | ${[oc({ text: 'dockblock' })]}
        ${fix('sample-with-errors.ts')}            | ${'main'}       | ${undefined} | ${[]}
        ${fix('sample-with-cspell-directives.ts')} | ${'grrrr'}      | ${undefined} | ${[]}
    `('checkText async $filename "$startText"', async ({ filename, startText, endText, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, {}, {});
        await dVal.prepare();
        const startOffset = doc.text.indexOf(startText);
        const endOffset = endText
            ? doc.text.indexOf(endText, startOffset + startText.length) + endText.length
            : startOffset + startText.length;
        assert(startOffset >= 0);
        const range = [startOffset, endOffset] as const;
        const text = doc.text.slice(startOffset, endOffset);
        expect(dVal.checkText(range, text, [])).toEqual(expected);
        expect(dVal.prepTime).toBeGreaterThan(0);
    });

    test.each`
        filename                                   | text            | configFile            | expected
        ${__filename}                              | ${'__filename'} | ${undefined}          | ${[]}
        ${fix('sample-with-errors.ts')}            | ${'Helllo'}     | ${undefined}          | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'Helllo'}     | ${fix('cspell.json')} | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'main'}       | ${undefined}          | ${[]}
        ${fix('sample-with-cspell-directives.ts')} | ${'grrrr'}      | ${undefined}          | ${[]}
    `('checkText sync $filename "$text"', async ({ filename, text, expected, configFile }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, { configFile }, {});
        dVal.prepareSync();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        expect(dVal.checkText(range, text, [])).toEqual(expected);
        expect(dVal.prepTime).toBeGreaterThan(0);
    });

    test.each`
        filename                        | text        | expected
        ${fix('sample-with-errors.ts')} | ${'Helllo'} | ${[oc({ text: 'Helllo', suggestions: ac(['hello']) })]}
    `('checkText suggestions $filename "$text"', async ({ filename, text, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, { generateSuggestions: true }, {});
        dVal.prepareSync();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        const result = dVal.checkText(range, text, []);
        expect(result).toEqual(expected);
        for (const r of result) {
            expect(r.suggestions).toBe(r.suggestions);
        }
        expect(dVal.prepTime).toBeGreaterThan(0);
    });

    // cspell:ignore kount naame colector Reciever reciever recievers serrors dockblock
    test.each`
        filename                             | maxDuplicateProblems | expectedIssues                                                                                                                                                                                | expectedRawIssues
        ${fix('sample-with-errors.ts')}      | ${undefined}         | ${['dockblock', 'Helllo']}                                                                                                                                                                    | ${undefined}
        ${fix('sample-with-many-errors.ts')} | ${undefined}         | ${['reciever', 'naame', 'naame', 'naame', 'reciever', 'Reciever', 'naame', 'Reciever', 'naame', 'kount', 'Reciever', 'kount', 'colector', 'recievers', 'Reciever', 'recievers', 'recievers']} | ${undefined}
        ${fix('sample-with-many-errors.ts')} | ${1}                 | ${['reciever', 'naame', 'Reciever', 'kount', 'colector', 'recievers']}                                                                                                                        | ${undefined}
        ${fix('parser/sample.ts')}           | ${1}                 | ${['serrors']}                                                                                                                                                                                | ${['\\x73errors']}
    `(
        'checkDocument $filename $maxDuplicateProblems',
        async ({ filename, maxDuplicateProblems, expectedIssues, expectedRawIssues }) => {
            const doc = await loadDoc(filename);
            const dVal = new DocumentValidator(doc, { generateSuggestions: false }, { maxDuplicateProblems });
            await dVal.prepare();
            const r = dVal.checkDocument();

            expect(r.map((issue) => issue.text)).toEqual(expectedIssues);
            expect(extractRawText(doc.text, r)).toEqual(expectedRawIssues ?? expectedIssues);
        }
    );

    test('updateDocumentText', () => {
        // cspell:ignore foor
        const expectedIssues = [
            oc({
                text: 'foor',
                isFound: false,
                isFlagged: false,
                line: { text: 'foor\n', offset: 14, position: { character: 0, line: 3 } },
            }),
        ];
        const doc = td('files://words.txt', 'one\ntwo\nthree\nfoor\n', 'plaintext');
        const dVal = new DocumentValidator(doc, { generateSuggestions: false }, {});
        dVal.prepareSync();
        const r = dVal.checkDocument();
        expect(r).toEqual(expectedIssues);
        dVal.updateDocumentText(doc.text + '# cspell:ignore foor\n');
        expect(dVal.checkDocument()).toEqual([]);
    });
});

function extractRawText(text: string, issues: ValidationIssue[]): string[] {
    return issues.map((issue) => {
        const start = issue.offset;
        const end = start + (issue.length ?? issue.text.length);
        return text.slice(start, end);
    });
}

function td(uri: string, content: string, languageId?: string, locale?: string, version = 1): TextDocument {
    return createTextDocument({ uri, content, languageId, locale, version });
}

async function _loadDoc(filename: string): Promise<TextDocument> {
    const content = await fs.readFile(filename, 'utf8');

    return createTextDocument({ uri: filename, content });
}

function loadDoc(filename: string) {
    return docCache.get(filename);
}

function fix(fixtureFile: string): string {
    return path.resolve(path.join(fixturesDir, 'docValidator'), fixtureFile);
}
