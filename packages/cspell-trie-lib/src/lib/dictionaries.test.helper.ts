import { Trie } from './trie';
import { readTrieFileFromConfig, readTrieFile } from './reader.test.helper';
import * as path from 'path';

const tries = new Map<string, Promise<Trie>>();

export function readTrie(name: string): Promise<Trie> {
    if (!tries.has(name)) {
        const pkg = require(name);
        tries.set(name, readTrieFileFromConfig(pkg.getConfigLocation()));
    }

    return tries.get(name)!;
}

const sampleTries = new Map<string, Promise<Trie>>();
const samplesLocation = path.join(
    __dirname,
    ...'../../../Samples/dicts'.split('/')
);

export function readSampleTrie(name: string): Promise<Trie> {
    if (!sampleTries.has(name)) {
        sampleTries.set(
            name,
            readTrieFile(path.resolve(samplesLocation, name))
        );
    }
    return sampleTries.get(name)!;
}
