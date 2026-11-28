import { findMatchingFileTypes, isFileTypeGenerated } from '@cspell/filetypes';

import type { Uri } from '../util/IUri.js';
import { toUri } from '../util/Uri.js';
import type { Document } from './Document.js';
import { normalizeLanguageIds } from './normalizeLanguageIds.js';

export function isBinaryDoc(document: Document): boolean {
    return isBinaryFile(toUri(document.uri), document.languageId, document.text);
}

export function isBinaryFile(filename: Uri | URL | string, languageId?: string | string[], text?: string): boolean {
    const filenameUri = toUri(filename);
    if (languageId) {
        const ids = normalizeLanguageIds(languageId);
        if (ids.length) return isFileTypeGenerated(ids);
    }
    const ids = findMatchingFileTypes(filenameUri.path);
    if (ids.length) return isFileTypeGenerated(ids);
    // Unknown file type, check the content.
    return text?.slice(0, 1024).includes('\u0000') || false;
}
