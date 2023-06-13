import { decodeTrieData } from './io/index.js';
import { type ITrie, ITrieImpl } from './ITrie.js';

export function decodeTrie(raw: string | Buffer): ITrie {
    const data = decodeTrieData(raw);
    return new ITrieImpl(data);
}
