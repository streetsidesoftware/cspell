import { decodeTrieData } from './io/index.ts';
import { type ITrie, ITrieImpl } from './ITrie.ts';
import { measurePerf } from './utils/performance.ts';

export function decodeTrie(raw: string | ArrayBufferView<ArrayBuffer> | Uint8Array<ArrayBuffer>): ITrie {
    const endPerf = measurePerf('decodeTrie');
    const data = decodeTrieData(raw);
    const t = new ITrieImpl(data);
    endPerf();
    return t;
}
