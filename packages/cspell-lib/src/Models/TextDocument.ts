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
    getLine(lineNum: number): TextDocumentLine;
    getLines(): Iterable<TextDocumentLine>;
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
        return this.getLine(position.line);
    }

    getLine(lineNum: number): TextDocumentLine {
        const position = { line: lineNum, character: 0 };
        const end = { line: lineNum + 1, character: 0 };
        const range = {
            start: position,
            end,
        };
        const lineOffset = this.vsTextDoc.offsetAt(position);
        const text = this.vsTextDoc.getText(range);
        return {
            text,
            offset: lineOffset,
            position,
        };
    }

    /**
     * Iterate over the lines of a document one-by-one.
     * Changing the document between iterations can change the result
     */
    *getLines(): Iterable<TextDocumentLine> {
        const range = {
            start: { line: 0, character: 0 },
            end: { line: 1, character: 0 },
        };
        while (this.vsTextDoc.offsetAt(range.end) > this.vsTextDoc.offsetAt(range.start)) {
            const offset = this.vsTextDoc.offsetAt(range.start);
            yield {
                text: this.vsTextDoc.getText(range),
                offset,
                position: range.start,
            };
            ++range.start.line;
            ++range.end.line;
        }
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
    assert(isTextDocumentImpl(doc), 'Unknown TextDocument type');
    return doc.update(edits, version);
}

function isTextDocumentImpl(doc: TextDocument | unknown): doc is TextDocumentImpl {
    return doc instanceof TextDocumentImpl;
}

export const isTextDocument: (doc: TextDocument | unknown) => doc is TextDocument = isTextDocumentImpl;
