import { promises as fs } from 'fs';
import { resolve as importResolve } from 'import-meta-resolve';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { importTrieV3AsFastTrieBlob } from '../lib/io/importV3FastBlob.js';
import type { Trie } from '../lib/trie.js';
import type { FastTrieBlob } from '../lib/TrieBlob/FastTrieBlob.js';
import { readRawDictionaryFileFromConfig, readTrieFile, readTrieFileFromConfig } from './reader.test.helper.js';
import { resolveGlobalDict, resolveGlobalSample } from './samples.js';

const tries = new Map<string, Promise<Trie>>();

export function readTrieFromConfig(name: string): Promise<Trie> {
    return memorize(name, tries, (name) => {
        const pkgLocation = fileURLToPath(importResolve(name, import.meta.url));
        return readTrieFileFromConfig(pkgLocation);
    });
}

export async function readAndProcessDictionaryFile<T>(
    processor: (data: Buffer) => T,
    pathOrPackage: string,
    dictionaryName?: string
) {
    const pkgLocation = fileURLToPath(importResolve(pathOrPackage, import.meta.url));
    const buf = await readRawDictionaryFileFromConfig(pkgLocation, dictionaryName);
    return processor(buf);
}

export async function readFastTrieBlobFromConfig(
    pathOrPackage: string,
    dictionaryName?: string
): Promise<FastTrieBlob> {
    return readAndProcessDictionaryFile(
        (buf) => importTrieV3AsFastTrieBlob(buf.toString('utf8')),
        pathOrPackage,
        dictionaryName
    );
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
