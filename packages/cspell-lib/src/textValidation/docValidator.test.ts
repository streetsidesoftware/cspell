import { promises as fs } from 'fs';
import * as path from 'path';
import { createTextDocument, TextDocument } from '../Models/TextDocument';
import { AutoCache } from '../util/simpleCache';
import { DocumentValidator } from './docValidator';

const docCache = new AutoCache(_loadDoc, 100);

describe('docValidator', () => {
    test('DocumentValidator', () => {
        const doc = td(__filename, '/** This is some code */');
        const dVal = new DocumentValidator(doc, {}, {});
        expect(dVal.document).toBe(doc);
        dVal.prepareSync();
        expect(dVal.checkText([0, 0], '', [])).toEqual([]);
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
