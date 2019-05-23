import {Trie} from './trie';
import {readTrieFile} from './reader.test.helper';

const tries: Map<string, Promise<Trie>> = new Map();

export function readTrie(name: string) {
    if (!tries.has(name)) {
        const pkg = require(name);
        tries.set(name, readTrieFile(pkg.getConfigLocation()));
    }

    return tries.get(name)!;
}

