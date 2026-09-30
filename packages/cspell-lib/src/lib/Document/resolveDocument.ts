import { readFile } from 'node:fs/promises';

import type { TextEncoding } from 'cspell-io';

import { readTextFile } from '../fileSystem.js';
import type { TextDocument } from '../Models/TextDocument.js';
import { createTextDocument } from '../Models/TextDocument.js';
import * as Uri from '../util/Uri.js';
import { clean } from '../util/util.js';
import type { Document, DocumentWithText } from './Document.js';

type DocumentEncoding = Extract<BufferEncoding, TextEncoding>;

const defaultEncoding: DocumentEncoding = 'utf8';

export function fileToDocument(file: string): Document;
export function fileToDocument(file: string, text: string, languageId?: string, locale?: string): DocumentWithText;
export function fileToDocument(
    file: string,
    text?: string,
    languageId?: string,
    locale?: string,
): Document | DocumentWithText;
export function fileToDocument(
    file: string,
    text?: string,
    languageId?: string,
    locale?: string,
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

async function readDocument(filename: string, encoding: DocumentEncoding = defaultEncoding): Promise<DocumentWithText> {
    const text = await readFile(filename, encoding);
    const uri = Uri.toUri(filename).toString();

    return {
        uri,
        text,
    };
}
export function resolveDocument(
    document: DocumentWithText | Document,
    encoding?: DocumentEncoding,
): Promise<DocumentWithText> {
    if (isDocumentWithText(document)) return Promise.resolve(document);
    const uri = Uri.toUri(document.uri);
    if (uri.scheme === 'stdin') {
        throw new Error(`Unsupported schema: "${uri.scheme}", open "${uri.toString()}"`);
    }
    if (uri.scheme !== 'file') {
        return readDocumentFromUrl(document.uri, encoding);
    }
    return readDocument(Uri.uriToFilePath(uri), encoding);
}

async function readDocumentFromUrl(
    uri: string,
    encoding: DocumentEncoding = defaultEncoding,
): Promise<DocumentWithText> {
    const text = await readTextFile(Uri.documentUriToURL(uri), encoding);
    return { uri, text };
}

function isDocumentWithText(doc: DocumentWithText | Document): doc is DocumentWithText {
    return doc.text !== undefined;
}
