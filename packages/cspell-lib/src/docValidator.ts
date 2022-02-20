import type { CSpellUserSettings } from '@cspell/cspell-types';
import { assert } from 'console';
import { ValidationIssue } from '.';
import { TextDocument } from './Models/TextDocument';

export class DocumentValidator {
    private _document: TextDocument;
    private _ready = false;

    /**
     * @param doc - Document to validate
     * @param config - configuration to use (not finalized).
     */
    constructor(doc: TextDocument, readonly settings: CSpellUserSettings) {
        this._document = doc;
    }

    get ready() {
        return this._ready;
    }

    prepareSync() {
        // @todo
        // Determine doc settings.
        // Calc include ranges
        // Load dictionaries
        this._ready = true;
    }

    checkText(_range: SimpleRange, _text: string, _scope: string[]): ValidationIssue[] {
        assert(this._ready);
        // Determine settings for text range
        // Slice text based upon include ranges
        // Check text against dictionaries.
        return [];
    }

    get document() {
        return this._document;
    }
}

export type Offset = number;

export type SimpleRange = [Offset, Offset];
