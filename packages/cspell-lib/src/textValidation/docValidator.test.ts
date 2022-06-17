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

    // cspell:ignore Helllo grrrr

    test.each`
        filename                                   | text            | expected
        ${__filename}                              | ${'__filename'} | ${[]}
        ${fix('sample-with-errors.ts')}            | ${'Helllo'}     | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'main'}       | ${[]}
        ${fix('sample-with-cspell-directives.ts')} | ${'grrrr'}      | ${[]}
    `('checkText async $filename "$text"', async ({ filename, text, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, {}, {});
        await dVal.prepare();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        expect(dVal.checkText(range, text, [])).toEqual(expected);
        expect(dVal.prepTime).toBeGreaterThan(0);
    });

    test.each`
        filename                                   | text            | expected
        ${__filename}                              | ${'__filename'} | ${[]}
        ${fix('sample-with-errors.ts')}            | ${'Helllo'}     | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'main'}       | ${[]}
        ${fix('sample-with-cspell-directives.ts')} | ${'grrrr'}      | ${[]}
    `('checkText sync $filename "$text"', async ({ filename, text, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, {}, {});
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

    // cspell:ignore kount naame colector Reciever reciever recievers serrors
    test.each`
        filename                             | maxDuplicateProblems | expectedIssues                                                                                                                                                                                | expectedRawIssues
        ${fix('sample-with-errors.ts')}      | ${undefined}         | ${['Helllo']}                                                                                                                                                                                 | ${['Helllo']}
        ${fix('sample-with-many-errors.ts')} | ${undefined}         | ${['reciever', 'naame', 'naame', 'naame', 'reciever', 'Reciever', 'naame', 'Reciever', 'naame', 'kount', 'Reciever', 'kount', 'colector', 'recievers', 'Reciever', 'recievers', 'recievers']} | ${['reciever', 'naame', 'naame', 'naame', 'reciever', 'Reciever', 'naame', 'Reciever', 'naame', 'kount', 'Reciever', 'kount', 'colector', 'recievers', 'Reciever', 'recievers', 'recievers']}
        ${fix('sample-with-many-errors.ts')} | ${1}                 | ${['reciever', 'naame', 'Reciever', 'kount', 'colector', 'recievers']}                                                                                                                        | ${['reciever', 'naame', 'Reciever', 'kount', 'colector', 'recievers']}
        ${fix('parser/sample.ts')}           | ${1}                 | ${['serrors']}                                                                                                                                                                                | ${['\\x73err' /* should be '\\x73errors' */]}
    `(
        'checkDocument $filename $maxDuplicateProblems',
        async ({ filename, maxDuplicateProblems, expectedIssues, expectedRawIssues }) => {
            const doc = await loadDoc(filename);
            const dVal = new DocumentValidator(doc, { generateSuggestions: false }, { maxDuplicateProblems });
            await dVal.prepare();
            const r = dVal.checkDocument();

            expect(r.map((issue) => issue.text)).toEqual(expectedIssues);
            expect(extractRawText(doc.text, r)).toEqual(expectedRawIssues);
        }
    );
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
