import { decodeTrieData } from './io/index.ts';
import { type ITrie, ITrieImpl } from './ITrie.ts';

export function decodeTrie(raw: string | ArrayBufferView<ArrayBuffer> | Uint8Array<ArrayBuffer>): ITrie {
    const data = decodeTrieData(raw);
    return new ITrieImpl(data);
}
