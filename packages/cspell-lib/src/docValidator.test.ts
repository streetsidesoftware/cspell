import { DocumentValidator } from './docValidator';
import { TextDocument, createTextDocument } from './Models/TextDocument';

describe('docValidator', () => {
    test('DocumentValidator', () => {
        const doc = td(__filename, '/** This is some code */');
        const dVal = new DocumentValidator(doc, {});
        expect(dVal.document).toBe(doc);
        expect(dVal.checkText([0, 0], '', [])).toEqual([]);
    });
});

function td(uri: string, content: string, languageId?: string, version = 1): TextDocument {
    return createTextDocument(uri, content, languageId, version);
}
