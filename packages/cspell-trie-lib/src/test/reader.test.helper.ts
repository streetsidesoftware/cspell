import * as path from 'path';
import * as zlib from 'zlib';
import * as fs from 'fs-extra';

import { importTrie } from '../lib/io/importExport';
import { Trie } from '../lib/trie';

export async function readTrieFileFromConfig(configLocation: string): Promise<Trie> {
    const json = await fs.readFile(configLocation, 'utf-8');
    const config = JSON.parse(json.replace(/\/\/.*/g, ''));
    const dictDef = (config && config.dictionaryDefinitions && config.dictionaryDefinitions[0]) || {};
    const dictPath = path.join(dictDef.path || '', dictDef.file || '');
    const pathToDict = path.join(path.dirname(configLocation), dictPath);
    return readTrieFile(pathToDict);
}

export async function readTrieFile(filename: string): Promise<Trie> {
    const trieFileContents = await fs
        .readFile(filename)
        .then((buffer) => (filename.match(/\.gz$/) ? zlib.gunzipSync(buffer) : buffer))
        .then((buffer) => buffer.toString('utf8'));
    const trieLines = trieFileContents.split('\n');
    const trieNode = importTrie(trieLines);
    return new Trie(trieNode);
}
