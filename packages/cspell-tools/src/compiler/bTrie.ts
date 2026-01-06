import { mkdir } from 'node:fs/promises';
import fsPath from 'node:path';

import { encodeTrieDataToBTrie } from 'cspell-trie-lib';

import type { BTrieOptions } from '../config/config.ts';
import { writeFile } from '../util/writeFile.ts';
import { createReader } from './Reader.ts';

export interface GenerateBTrieOptions extends BTrieOptions {
    /** output directory */
    output?: string;
}

export async function generateBTrieFromFile(file: string, options: GenerateBTrieOptions): Promise<void> {
    console.log(`Processing file: ${file}`);
    const btrie = await createBTrieFromFile(file, options);
    const outFile = bTrieFileName(file, options);
    await mkdir(fsPath.dirname(outFile), { recursive: true });
    await writeFile(outFile, btrie);
    console.log(`Written BTrie to: ${outFile}`);
}

export async function generateBTrieFromFiles(files: string[], options: GenerateBTrieOptions): Promise<void> {
    console.log(`Generating BTrie for ${files.length} file(s).`);
    for (const file of files) {
        await generateBTrieFromFile(file, options);
    }
}

function bTrieFileName(inputFilename: string, options: GenerateBTrieOptions): string {
    let filename = inputFilename;
    filename = filename.replace(/\.gz$/i, '');
    filename = filename.replace(/\.(aff|dic|txt|b?trie)$/i, '');
    filename = filename + `.btrie`;
    if (options.compress) {
        filename += '.gz';
    }
    if (options.output) {
        const base = fsPath.basename(filename);
        filename = fsPath.join(fsPath.resolve(options.output), base);
    }
    return filename;
}

export async function createBTrieFromFile(file: string, buildOptions: GenerateBTrieOptions): Promise<Uint8Array> {
    const reader = await createReader(file, {});

    const trie = reader.toTrie();

    return encodeTrieDataToBTrie(trie.data, buildOptions);
}
