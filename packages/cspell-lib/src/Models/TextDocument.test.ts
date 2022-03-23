import { createTextDocument, updateTextDocument } from './TextDocument';
import { Uri } from './Uri';

describe('TextDocument', () => {
    test('create', () => {
        const content = '/** this is some code */';
        const doc = createTextDocument({ uri: __filename, content });
        expect(doc.text).toBe(content);
        expect(doc.languageId).toContain('typescript');
        expect(doc.uri).toBeInstanceOf(Uri);
        expect(doc.uri.toString()).toEqual(Uri.file(__filename).toString());
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
