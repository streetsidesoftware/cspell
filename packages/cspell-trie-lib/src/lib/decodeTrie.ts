import { decodeTrieData } from './io/index.ts';
import { type ITrie, ITrieImpl } from './ITrie.ts';
import type { ParseDictionaryOptions } from './SimpleDictionaryParser.ts';
import { parseDictionary } from './SimpleDictionaryParser.ts';
import { encodeITrieToBTrie } from './TrieBlob/index.ts';
import { decompress } from './utils/decompress.ts';
import { measurePerf } from './utils/performance.ts';

export function decodeTrie(raw: string | ArrayBufferView<ArrayBuffer> | Uint8Array<ArrayBuffer>): ITrie {
    const endPerf = measurePerf('decodeTrie');
    const data = decodeTrieData(raw);
    const t = new ITrieImpl(data);
    endPerf();
    return t;
}

export interface FileResource {
    /**
     * The URL of the File
     */
    readonly url: URL;

    /**
     * The contents of the file
     */
    readonly content: string | Uint8Array<ArrayBuffer>;
}

export async function decodeFile(file: FileResource, options?: Partial<ParseDictionaryOptions>): Promise<ITrie> {
    let pathname = file.url.pathname;
    let content = file.content;
    if (pathname.endsWith('.gz')) {
        pathname = pathname.slice(0, -3);
        if (typeof content !== 'string') {
            content = await decompress(content, 'gzip');
        }
    }
    if (pathname.endsWith('.trie') || pathname.endsWith('.btrie')) {
        return decodeTrie(content);
    }

    const textContent = typeof content === 'string' ? content : new TextDecoder().decode(content);

    return parseDictionary(textContent, options);
}

export async function convertToBTrie(
    file: FileResource,
    options?: Partial<ParseDictionaryOptions>,
): Promise<FileResource> {
    const trie = await decodeFile(file, options);
    const bTrieData = encodeITrieToBTrie(trie, options);
    const url = new URL(file.url);
    url.pathname = url.pathname.replaceAll(/\.gz$/g, '');
    url.pathname = url.pathname.split('.').slice(0, -1).join('.') + '.btrie';
    return {
        url,
        content: bTrieData,
    };
}
