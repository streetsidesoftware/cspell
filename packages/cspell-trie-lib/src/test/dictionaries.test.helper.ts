import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { importTrieV3AsTrieBlob } from '../lib/io/importV3FastBlob.ts';
import type { Trie } from '../lib/trie.ts';
import type { TrieBlob } from '../lib/TrieBlob/index.ts';
import {
    readRawDictionaryFileFromConfig,
    readTrieFileAsTrie,
    readTrieFileFromConfig,
    resolveModule,
} from './reader.test.helper.ts';
import { resolveGlobalDict, resolveGlobalSample } from './samples.ts';

const tries = new Map<string, Promise<Trie>>();

export function readTrieFromConfig(name: string): Promise<Trie> {
    return memorize(name, tries, (name) => {
        const pkgLocation = fileURLToPath(resolveModule(name));
        return readTrieFileFromConfig(pkgLocation);
    });
}

export async function readAndProcessDictionaryFile<T>(
    processor: (data: Buffer) => T,
    pathOrPackage: string,
    dictionaryName?: string,
): Promise<T> {
    const pkgLocation = fileURLToPath(resolveModule(pathOrPackage));
    const buf = await readRawDictionaryFileFromConfig(pkgLocation, dictionaryName);
    return processor(buf);
}

export async function readTrieBlobFromConfig(pathOrPackage: string, dictionaryName?: string): Promise<TrieBlob> {
    return readAndProcessDictionaryFile(
        (buf) => importTrieV3AsTrieBlob(buf.toString('utf8')),
        pathOrPackage,
        dictionaryName,
    );
}

const sampleTries = new Map<string, Promise<Trie>>();
const samplesLocation = resolveGlobalSample('dicts');

export function readSampleTrie(name: string): Promise<Trie> {
    return memorize(name, sampleTries, (name) => readTrieFileAsTrie(path.resolve(samplesLocation, name)));
}

function memorize<V>(key: string, map: Map<string, V>, resolve: (key: string) => V): V {
    const v = map.get(key);
    if (v) return v;
    const r = resolve(key);
    map.set(key, r);
    return r;
}

export function readRawDictionaryFile(name: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    return fs.readFile(resolveGlobalDict(name), encoding);
}

// cspell:ignore conv OCONV
