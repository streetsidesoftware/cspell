import { CSpellSettingsInternal } from './Models/CSpellSettingsInternalDef';

export class DocumentValidator {
    private _document: TextDocument;

    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc: TextDocument, readonly config: CSpellSettingsInternal) {
        this._document = doc;
    }

    get document() {
        return this._document;
    }
}

export type DocumentUri = string;

/**
 * A simple text document. Not to be implemented. The document keeps the content
 * as string.
 */
export interface TextDocument {
    /**
     * The associated URI for this document. Most documents have the __file__-scheme, indicating that they
     * represent files on disk. However, some documents may have other schemes indicating that they are not
     * available on disk.
     */
    readonly uri: DocumentUri;
    /**
     * The identifier of the language associated with this document.
     */
    readonly languageId: string;
    /**
     * The version number of this document (it will increase after each
     * change, including undo/redo).
     */
    readonly version: number;
    /**
     * the Document Text
     */
    readonly text: string;
}
