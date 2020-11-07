import { Trie } from './trie';
import { importTrie } from './importExport';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';

export async function readTrieFileFromConfig(configLocation: string): Promise<Trie> {
    const buffer = await fs.readFile(configLocation);
    const json = buffer.toString();
    const config = JSON.parse(json.replace(/\/\/.*/g, ''));
    const dictDef = (config && config.dictionaryDefinitions && config.dictionaryDefinitions[0]) || {};
    const dictPath = dictDef.file || '';
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
