import { Trie } from '../lib/trie';
import { readTrieFileFromConfig, readTrieFile } from './reader.test.helper';
import * as path from 'path';
import { resolveGlobalSample } from './samples';

const tries = new Map<string, Promise<Trie>>();

export function readTrie(name: string): Promise<Trie> {
    return memorize(name, tries, (name) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pkgLocation = require.resolve(name);
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
