import { Trie } from './trie';
import { readTrieFileFromConfig, readTrieFile } from './reader.test.helper';
import * as path from 'path';

const tries = new Map<string, Promise<Trie>>();

export function readTrie(name: string): Promise<Trie> {
    return memorize(name, tries, (name) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkg = require(name);
        return readTrieFileFromConfig(pkg.getConfigLocation());
    });
}

const sampleTries = new Map<string, Promise<Trie>>();
const samplesLocation = path.join(__dirname, ...'../../../Samples/dicts'.split('/'));

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
