import { readFile } from 'fs/promises';
import { URI } from 'vscode-uri';

import type { TextDocument } from '../Models/TextDocument';
import { createTextDocument } from '../Models/TextDocument';
import { defaultEncoding } from '../spellCheckFile';
import { clean } from '../util/util';
import type { Document, DocumentWithText } from '.';

export function fileToDocument(file: string): Document;
export function fileToDocument(file: string, text: string, languageId?: string, locale?: string): DocumentWithText;
export function fileToDocument(
    file: string,
    text?: string,
    languageId?: string,
    locale?: string
): Document | DocumentWithText;
export function fileToDocument(
    file: string,
    text?: string,
    languageId?: string,
    locale?: string
): Document | DocumentWithText {
    return clean({
        uri: URI.file(file).toString(),
        text,
        languageId,
        locale,
    });
}

export async function fileToTextDocument(file: string): Promise<TextDocument> {
    return documentToTextDocument(await resolveDocument(fileToDocument(file)));
}
export function documentToTextDocument(document: DocumentWithText): TextDocument {
    const { uri, text: content, languageId, locale } = document;
    return createTextDocument({ uri, content, languageId, locale });
}

export async function resolveDocumentToTextDocument(doc: Document): Promise<TextDocument> {
    return documentToTextDocument(await resolveDocument(doc));
}

async function readDocument(filename: string, encoding: BufferEncoding = defaultEncoding): Promise<DocumentWithText> {
    const text = await readFile(filename, encoding);
    const uri = URI.file(filename).toString();

    return {
        uri,
        text,
    };
}
export function resolveDocument(
    document: DocumentWithText | Document,
    encoding?: BufferEncoding
): Promise<DocumentWithText> {
    if (isDocumentWithText(document)) return Promise.resolve(document);
    const uri = URI.parse(document.uri);
    if (uri.scheme !== 'file') {
        throw new Error(`Unsupported schema: "${uri.scheme}", open "${uri.toString()}"`);
    }
    return readDocument(uri.fsPath, encoding);
}
function isDocumentWithText(doc: DocumentWithText | Document): doc is DocumentWithText {
    return doc.text !== undefined;
}
