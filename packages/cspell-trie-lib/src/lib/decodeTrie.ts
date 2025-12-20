import type { Buffer } from 'node:buffer';

import { decodeTrieData } from './io/index.ts';
import { type ITrie, ITrieImpl } from './ITrie.ts';

export function decodeTrie(raw: string | Buffer): ITrie {
    const data = decodeTrieData(raw);
    return new ITrieImpl(data);
}
