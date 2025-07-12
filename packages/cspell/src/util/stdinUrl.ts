import assert from 'node:assert';

import { toFileURL } from '@cspell/url';

import { STDINProtocol } from './constants.js';

export function isStdinUrl(url: string | URL): boolean {
    if (url instanceof URL) {
        return url.protocol === STDINProtocol;
    }
    return url.startsWith(STDINProtocol);
}

/**
 * Normalize and resolve a stdin url.
 * @param url - stdin url to resolve.
 * @param cwd - file path to resolve relative paths against.
 * @returns
 */
export function resolveStdinUrl(url: string, cwd: string): string {
    assert(url.startsWith(STDINProtocol), `Expected url to start with ${STDINProtocol}`);
    const path = decodeURIComponent(url)
        .slice(STDINProtocol.length)
        .replace(/^\/\//, '')
        .replace(/^\/([a-z]:)/i, '$1');
    const fileUrl = toFileURL(path, cwd);
    // If the path is empty,
    return fileUrl.toString().replace(/^file:/, STDINProtocol) + (path ? '' : '/');
}
