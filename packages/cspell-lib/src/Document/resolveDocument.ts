import { readFile } from 'fs/promises';

import type { TextDocument } from '../Models/TextDocument';
import { createTextDocument } from '../Models/TextDocument';
import * as Uri from '../util/Uri';
import { clean } from '../util/util';
import type { Document, DocumentWithText } from './Document';

const defaultEncoding: BufferEncoding = 'utf8';

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
        uri: Uri.toUri(file).toString(),
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
    const uri = Uri.toUri(filename).toString();

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
    const uri = Uri.toUri(document.uri);
    if (uri.scheme !== 'file') {
        throw new Error(`Unsupported schema: "${uri.scheme}", open "${uri.toString()}"`);
    }
    return readDocument(Uri.uriToFilePath(uri), encoding);
}
function isDocumentWithText(doc: DocumentWithText | Document): doc is DocumentWithText {
    return doc.text !== undefined;
}
