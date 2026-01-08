/* eslint-disable n/no-unsupported-features/node-builtins */
import type { Buffer } from 'node:buffer';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as zlib from 'node:zlib';

import type { CSpellUserSettings } from '@cspell/cspell-types';

import type { ITrie } from '../lib/index.ts';
import { decodeTrie } from '../lib/index.ts';
import { importTrie } from '../lib/io/importExport.ts';
import { parseDictionary, parseDictionaryLegacy } from '../lib/SimpleDictionaryParser.ts';
import { Trie } from '../lib/trie.ts';
import { memorizer } from '../lib/utils/memorizer.ts';

function isGZipped(buf: Buffer): boolean {
    return buf[0] === 0x1f && buf[1] === 0x8b;
}

interface DictionaryDef {
    name: string;
    path: string;
    file?: string;
}

export interface Config {
    dictionaryDefinitions?: DictionaryDef[];
}

export async function readConfig(configLocation: string): Promise<Config> {
    const resolved = resolveModule(configLocation);
    const json = await readFile(resolved, 'utf8');
    return JSON.parse(json.replaceAll(/\/\/.*/g, ''));
}

export async function readRawDictionaryFileFromConfig(configLocation: string, name?: string): Promise<Buffer> {
    const config = await readConfig(configLocation);
    const dictDefs = config.dictionaryDefinitions ?? [];
    const def = name ? dictDefs.find((def) => def.name === name) : dictDefs[0];
    if (!def) {
        throw new Error(`Dictionary: "${name || 0}" as ${configLocation} not found.`);
    }
    const dictPath = path.join(def.path || '', def.file || '');
    const pathToDict = path.join(path.dirname(configLocation), dictPath);
    return readFile(pathToDict);
}

export async function readTrieFileFromConfig(configLocation: string, name?: string): Promise<Trie> {
    const buf = await readRawDictionaryFileFromConfig(configLocation, name);
    const trieNode = importTrie(buf.toString('utf8'));
    return new Trie(trieNode);
}

export function resolveModule(modulePath: string | URL): URL {
    if (modulePath instanceof URL) {
        return modulePath;
    }
    if (modulePath.startsWith('file://')) {
        return new URL(modulePath);
    }
    return path.isAbsolute(modulePath) ? pathToFileURL(modulePath) : new URL(import.meta.resolve(modulePath));
}

export async function readConfiguration(modulePath: string | URL): Promise<CSpellUserSettings> {
    const resolved = resolveModule(modulePath);
    const json = await fs.readFile(resolved, 'utf8');
    return JSON.parse(json);
}

export const readModuleDictionary: typeof _readModuleDictionary = memorizer(_readModuleDictionary);

async function _readModuleDictionary(modulePath: string, name?: string): Promise<ITrie> {
    const resolved = resolveModule(modulePath);
    const config = await readConfiguration(modulePath);

    const dictDefs = config.dictionaryDefinitions ?? [];
    const def = name ? dictDefs.find((def) => def.name === name) : dictDefs[0];
    if (!def) {
        throw new Error(`Dictionary: "${name || 0}" as ${modulePath} not found.`);
    }
    const dictPath = new URL(def.path || '', resolved);

    if (dictPath.href.includes('.trie')) return readTrieFile(dictPath);
    return readWordList(dictPath);
}

// eslint-disable-next-line unicorn/text-encoding-identifier-case
type BufferEncoding = 'utf8' | 'utf-8';

/**
 * Read and possibly decompress a file.
 * @param filename
 * @returns
 */
export function readFile(filename: string | URL, encoding: BufferEncoding): Promise<string>;
export function readFile(filename: string | URL): Promise<Buffer<ArrayBuffer>>;
export function readFile(
    filename: string | URL,
    encoding: BufferEncoding | undefined,
): Promise<Buffer<ArrayBuffer> | string>;
export async function readFile(filename: string | URL, encoding?: BufferEncoding): Promise<Buffer | string> {
    const buf = await fs.readFile(filename).then((buffer) => (isGZipped(buffer) ? zlib.gunzipSync(buffer) : buffer));
    return encoding ? buf.toString(encoding) : buf;
}

export async function readTrieFileAsTrie(filename: string | URL): Promise<Trie> {
    const trieFileContents = await readFile(filename, 'utf8');
    const trieNode = importTrie(trieFileContents);
    return new Trie(trieNode);
}

export async function readWordListAsTrie(filename: string | URL): Promise<Trie> {
    const wordList = await readFile(filename, 'utf8');
    return parseDictionaryLegacy(wordList);
}

export async function readTrieFile(filename: string | URL): Promise<ITrie> {
    const trieFileContents = await readFile(filename);
    return decodeTrie(trieFileContents);
}

export async function readWordList(filename: string | URL): Promise<ITrie> {
    const wordList = await readFile(filename, 'utf8');
    return parseDictionary(wordList);
}
