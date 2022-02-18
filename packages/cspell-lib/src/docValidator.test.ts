import { DocumentValidator, TextDocument } from './docValidator';

describe('docValidator', () => {
    test('DocumentValidator', () => {
        const doc = td();
        const dVal = new DocumentValidator(doc, {});
        expect(dVal.document).toBe(doc);
        expect(dVal.checkText([0, 0], '', [])).toEqual([]);
    });
});

function td(...textDocParts: Partial<TextDocument>[]): TextDocument {
    const doc: TextDocument = { text: '', uri: '', languageId: 'text', version: 1 };
    for (const p of textDocParts) {
        Object.assign(doc, p);
    }
    return doc;
}
