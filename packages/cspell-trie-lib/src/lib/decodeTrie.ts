import { decodeTrieData } from './io/index.ts';
import { type ITrie, ITrieImpl } from './ITrie.ts';

export function decodeTrie(raw: string | ArrayBufferLike | Uint8Array): ITrie {
    const data = decodeTrieData(raw);
    return new ITrieImpl(data);
}
