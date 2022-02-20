import { createTextDocument } from './TextDocument';
import { Uri } from './Uri';

describe('TextDocument', () => {
    test('create', () => {
        const content = '/** this is some code */';
        const doc = createTextDocument(__filename, content);
        expect(doc.text).toBe(content);
        expect(doc.languageId).toContain('typescript');
        expect(doc.uri).toBeInstanceOf(Uri);
        expect(doc.uri.toString()).toEqual(Uri.file(__filename).toString());
    });
});
