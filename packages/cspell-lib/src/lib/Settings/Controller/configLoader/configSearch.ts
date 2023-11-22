import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { findUp, pathExists } from 'find-up';
import { fileURLToPath, pathToFileURL } from 'url';

export class ConfigSearch {
    private searchCache = new Map<string, Promise<URL | undefined>>();

    constructor(readonly searchPlaces: readonly string[]) {
        this.searchPlaces = searchPlaces;
    }

    async searchForConfig(searchFrom: URL | string): Promise<URL | undefined> {
        if (typeof searchFrom === 'string') {
            if (!searchFrom.startsWith('file:')) {
                return undefined;
            }
        } else {
            if (searchFrom.protocol !== 'file:') {
                return undefined;
            }
        }

        const dirUrl = new URL('.', searchFrom);
        const cached = this.searchCache.get(dirUrl.href);
        if (cached) {
            return cached;
        }

        const fromPath = fileURLToPath(dirUrl);

        const pending = findUpConfig(fromPath, this.searchPlaces);
        this.searchCache.set(dirUrl.href, pending);
        return pending;
    }

    clearCache() {
        this.searchCache.clear();
    }
}

async function findUpConfig(searchFromPath: string | URL, searchPlaces: readonly string[]): Promise<URL | undefined> {
    const found = await findUp((dir) => hasConfig(dir, searchPlaces), { cwd: searchFromPath, type: 'file' });
    return found ? pathToFileURL(found) : undefined;
}

async function hasConfig(dir: string, searchPlaces: readonly string[]): Promise<string | undefined> {
    for (const searchPlace of searchPlaces) {
        const file = path.join(dir, searchPlace);
        const found = await pathExists(file);
        if (found) {
            if (path.basename(file) !== 'package.json') return file;
            const content = await readFile(file, 'utf8');
            const pkg = JSON.parse(content);
            if (typeof pkg.cspell === 'object') return file;
        }
    }
    return undefined;
}
