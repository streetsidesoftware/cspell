import { Trie } from './trie';
import { readTrieFile } from './reader.test.helper';

const tries: Map<string, Promise<Trie>> = new Map();

export function readTrie(name: string): Promise<Trie> {
    const r = tries.get(name);
    if (r) {
        return r;
    }
    const pkg = require.resolve(name);
    const p = readTrieFile(pkg);
    tries.set(name, p);
    return p;
}
