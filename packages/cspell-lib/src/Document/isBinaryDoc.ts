import { URI, Utils as UriUtils } from 'vscode-uri';

import { isGenerated, isGeneratedFile } from '../LanguageIds';
import type { Document } from './Document';
import { normalizeLanguageIds } from './normalizeLanguageIds';

export function isBinaryDoc(document: Document): boolean {
    return isBinaryFile(URI.parse(document.uri), document.languageId);
}

export function isBinaryFile(filenameUri: URI, languageId?: string | string[]): boolean {
    if (languageId) {
        const ids = normalizeLanguageIds(languageId);
        if (ids.length) return isGenerated(ids);
    }
    const filename = UriUtils.basename(filenameUri);
    return isGeneratedFile(filename);
}
