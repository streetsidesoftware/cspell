import * as fs from 'fs/promises';
import * as path from 'path';
import * as zlib from 'zlib';

import { importTrie } from '../lib/io/importExport.js';
import { Trie } from '../lib/trie.js';

function isGZipped(buf: Buffer): boolean {
    return buf[0] == 0x1f && buf[1] === 0x8b;
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
    const json = await readFile(configLocation, 'utf-8');
    return JSON.parse(json.replace(/\/\/.*/g, ''));
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

type BufferEncoding = 'utf8' | 'utf-8';

/**
 * Read and possibly decompress a file.
 * @param filename
 * @returns
 */
export function readFile(filename: string, encoding: BufferEncoding): Promise<string>;
export function readFile(filename: string): Promise<Buffer>;
export function readFile(filename: string, encoding: BufferEncoding | undefined): Promise<Buffer | string>;
export async function readFile(filename: string, encoding?: BufferEncoding): Promise<Buffer | string> {
    const buf = await fs.readFile(filename).then((buffer) => (isGZipped(buffer) ? zlib.gunzipSync(buffer) : buffer));
    return encoding ? buf.toString(encoding) : buf;
}

export async function readTrieFile(filename: string): Promise<Trie> {
    const trieFileContents = await readFile(filename, 'utf8');
    const trieNode = importTrie(trieFileContents);
    return new Trie(trieNode);
}
