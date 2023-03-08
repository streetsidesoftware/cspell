import { describe, expect, test } from 'vitest';

import * as Uri from '../util/Uri';
import type { TextDocument } from './TextDocument';
import { createTextDocument, isTextDocument, updateTextDocument } from './TextDocument';

describe('TextDocument', () => {
    test('create', () => {
        const content = '/** this is some code */';
        const doc = createTextDocument({ uri: __filename, content });
        expect(doc.text).toBe(content);
        expect(doc.languageId).toContain('typescript');
        expect(Uri.isUri(doc.uri)).toBe(true);
        expect(doc.uri.toString().toLowerCase()).toEqual(Uri.fromFilePath(__filename).toString().toLowerCase());
    });

    test('update', () => {
        const doc = sampleDoc();
        expect(doc.version).toBe(1);
        const t = 'self';
        const textCopy = doc.text;
        const offset = doc.text.indexOf(t);
        updateTextDocument(doc, [{ range: [offset, offset + t.length], text: 'showSelf' }]);
        expect(doc.version).toBe(2);
        expect(doc.text).not.toEqual(textCopy);
        expect(doc.text.startsWith('showSelf', offset)).toBe(true);
        updateTextDocument(doc, [{ text: textCopy }]);
        expect(doc.text).toBe(textCopy);
    });

    test.each`
        doc            | expected
        ${''}          | ${false}
        ${{}}          | ${false}
        ${sampleDoc()} | ${true}
    `('isTextDocument $doc', ({ doc, expected }) => {
        expect(isTextDocument(doc)).toBe(expected);
    });

    test.each`
        doc
        ${''}
        ${sampleDoc()}
    `('getLines', ({ doc }: { doc: string | TextDocument }) => {
        doc = typeof doc === 'string' ? sampleDoc(undefined, doc) : doc;
        const lines = [...doc.getLines()];
        expect(lines.map((t) => t.text).join('')).toBe(doc.text);
    });
});

function sampleDoc(filename?: string, content?: string) {
    filename = filename ?? __filename;
    content =
        content ??
        `
import * as fs from 'fs';

export function self(): string {
    return fs.readFileSync(__filename, 'utf8');
}
`;
    return createTextDocument({ uri: filename, content });
}
