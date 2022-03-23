import { getLanguagesForBasename } from '../LanguageIds';
import * as Uri from './Uri';
import { TextDocument as VsTextDocument } from 'vscode-languageserver-textdocument';
import assert from 'assert';

export type DocumentUri = Uri.Uri;

export interface Position {
    line: number;
    character: number;
}

/**
 * Range offset tuple.
 */
export type SimpleRange = [start: number, end: number];

export interface TextDocumentLine {
    readonly text: string;
    readonly offset: number;
    readonly position: Position;
}

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
    readonly languageId: string | string[];
    /**
     * The version number of this document (it will increase after each
     * change, including undo/redo).
     */
    readonly version: number;
    /**
     * the raw Document Text
     */
    readonly text: string;

    /**
     * The natural language locale.
     */
    readonly locale?: string | undefined;

    positionAt(offset: number): Position;
    offsetAt(position: Position): number;
    lineAt(offset: number): TextDocumentLine;
}

class TextDocumentImpl implements TextDocument {
    private vsTextDoc: VsTextDocument;

    constructor(
        readonly uri: DocumentUri,
        text: string,
        readonly languageId: string | string[],
        readonly locale: string | undefined,
        version: number
    ) {
        const primaryLanguageId = typeof languageId === 'string' ? languageId : languageId[0] || 'plaintext';
        this.vsTextDoc = VsTextDocument.create(uri.toString(), primaryLanguageId, version, text);
    }

    get version(): number {
        return this.vsTextDoc.version;
    }

    get text(): string {
        return this.vsTextDoc.getText();
    }

    positionAt(offset: number): Position {
        return this.vsTextDoc.positionAt(offset);
    }

    offsetAt(position: Position): number {
        return this.vsTextDoc.offsetAt(position);
    }

    lineAt(offset: number): TextDocumentLine {
        const position = this.vsTextDoc.positionAt(offset);
        position.character = 0;
        const lineOffset = this.vsTextDoc.offsetAt(position);
        const range = {
            start: position,
            end: { line: position.line + 1, character: 0 },
        };
        let _text: string | undefined;
        const getText = () => this.vsTextDoc.getText(range);
        return {
            get text() {
                return _text ?? (_text = getText());
            },
            offset: lineOffset,
            position,
        };
    }

    /**
     * Apply edits to the text.
     * Note: the edits are applied one after the other.
     * @param edits - changes to the text
     * @param version - optional version to use.
     * @returns this
     */
    update(edits: TextDocumentContentChangeEvent[], version?: number): this {
        version = version ?? this.version + 1;
        for (const edit of edits) {
            const vsEdit = edit.range
                ? {
                      range: { start: this.positionAt(edit.range[0]), end: this.positionAt(edit.range[1]) },
                      text: edit.text,
                  }
                : edit;
            VsTextDocument.update(this.vsTextDoc, [vsEdit], version);
        }
        return this;
    }
}

export interface CreateTextDocumentParams {
    uri: DocumentUri | string;
    content: string;
    languageId?: string | string[] | undefined;
    locale?: string | undefined;
    version?: number | undefined;
}

export interface TextDocumentContentChangeEvent {
    range?: SimpleRange;
    text: string;
}

export function createTextDocument({
    uri,
    content,
    languageId,
    locale,
    version,
}: CreateTextDocumentParams): TextDocument {
    version = version ?? 1;
    uri = Uri.toUri(uri);
    languageId = languageId ?? getLanguagesForBasename(Uri.basename(uri));
    languageId = languageId.length === 0 ? 'text' : languageId;
    return new TextDocumentImpl(uri, content, languageId, locale, version);
}

export function updateTextDocument(
    doc: TextDocument,
    edits: TextDocumentContentChangeEvent[],
    version?: number
): TextDocument {
    assert(doc instanceof TextDocumentImpl, 'Unknown TextDocument type');
    return doc.update(edits, version);
}
