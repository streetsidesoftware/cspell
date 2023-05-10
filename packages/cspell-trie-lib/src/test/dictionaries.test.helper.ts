import { promises as fs } from 'fs';
import { resolve as importResolve } from 'import-meta-resolve';
import * as path from 'path';
import { fileURLToPath } from 'url';

import type { Trie } from '../lib/trie.js';
import { readTrieFile, readTrieFileFromConfig } from './reader.test.helper.js';
import { resolveGlobalDict, resolveGlobalSample } from './samples.js';

const tries = new Map<string, Promise<Trie>>();

export function readTrie(name: string): Promise<Trie> {
    return memorize(name, tries, (name) => {
        const pkgLocation = fileURLToPath(importResolve(name, import.meta.url));
        return readTrieFileFromConfig(pkgLocation);
    });
}

const sampleTries = new Map<string, Promise<Trie>>();
const samplesLocation = resolveGlobalSample('dicts');

export function readSampleTrie(name: string): Promise<Trie> {
    return memorize(name, sampleTries, (name) => readTrieFile(path.resolve(samplesLocation, name)));
}

function memorize<V>(key: string, map: Map<string, V>, resolve: (key: string) => V): V {
    const v = map.get(key);
    if (v) return v;
    const r = resolve(key);
    map.set(key, r);
    return r;
}

export function readRawDictionaryFile(name: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return fs.readFile(resolveGlobalDict(name), encoding);
}

// cspell:ignore conv OCONV
