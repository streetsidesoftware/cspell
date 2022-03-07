import assert from 'assert';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createTextDocument, TextDocument } from '../Models/TextDocument';
import { AutoCache } from '../util/simpleCache';
import { DocumentValidator } from './docValidator';

const docCache = new AutoCache(_loadDoc, 100);
const fixturesDir = path.join(__dirname, '../../fixtures');

const oc = expect.objectContaining;

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

    // cspell:ignore Helllo

    test.each`
        filename                        | text            | expected
        ${__filename}                   | ${'__filename'} | ${[]}
        ${fix('sample-with-errors.ts')} | ${'Helllo'}     | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')} | ${'main'}       | ${[]}
    `('checkText async $filename "$text"', async ({ filename, text, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, {}, {});
        await dVal.prepare();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        expect(dVal.checkText(range, text, [])).toEqual(expected);
    });

    test.each`
        filename                        | text            | expected
        ${__filename}                   | ${'__filename'} | ${[]}
        ${fix('sample-with-errors.ts')} | ${'Helllo'}     | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')} | ${'main'}       | ${[]}
    `('checkText sync $filename "$text"', async ({ filename, text, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, {}, {});
        dVal.prepareSync();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        expect(dVal.checkText(range, text, [])).toEqual(expected);
    });
});

function td(uri: string, content: string, languageId?: string, locale?: string, version = 1): TextDocument {
    return createTextDocument(uri, content, languageId, locale, version);
}

async function _loadDoc(filename: string): Promise<TextDocument> {
    const content = await fs.readFile(filename, 'utf8');

    return createTextDocument(filename, content);
}

function loadDoc(filename: string) {
    return docCache.get(filename);
}

function fix(fixtureFile: string): string {
    return path.resolve(path.join(fixturesDir, 'docValidator'), fixtureFile);
}
