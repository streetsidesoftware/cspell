import { isGenerated, isGeneratedFile } from '../LanguageIds.js';
import type { Uri } from '../util/Uri.js';
import { basename, toUri } from '../util/Uri.js';
import type { Document } from './Document.js';
import { normalizeLanguageIds } from './normalizeLanguageIds.js';

export function isBinaryDoc(document: Document): boolean {
    return isBinaryFile(toUri(document.uri), document.languageId);
}

export function isBinaryFile(filename: Uri | URL | string, languageId?: string | string[]): boolean {
    const filenameUri = toUri(filename);
    if (languageId) {
        const ids = normalizeLanguageIds(languageId);
        if (ids.length) return isGenerated(ids);
    }
    const file = basename(filenameUri);
    return isGeneratedFile(file);
}
