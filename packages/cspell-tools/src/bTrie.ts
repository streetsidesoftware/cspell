import { writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import zlib from 'node:zlib';

const gzip = promisify(zlib.gzip);

import { createBTrieFromFile } from './compiler/bTrie.ts';

export interface GenerateBTrieOptions {
    compress?: boolean;
    optimize?: boolean;
}

export function generateBTrie(files: string[], options: GenerateBTrieOptions): Promise<void> {
    return generateBTrieFromFiles(files, options);
}

async function generateBTrieFromFiles(files: string[], options: GenerateBTrieOptions): Promise<void> {
    const compress = options.compress ?? true;
    console.log(`Generating BTrie for ${files.length} file(s).`);
    for (const file of files) {
        console.log(`Processing file: ${file}`);
        const btrie = await createBTrieFromFile(file, options.optimize ?? true);
        let outFile = bTrieFileName(file);
        if (compress) {
            const gzipped = await gzip(btrie);
            outFile += '.gz';
            await writeFile(outFile, gzipped);
        } else {
            await writeFile(outFile, btrie);
        }
        console.log(`Written BTrie to: ${outFile}`);
    }
}

function bTrieFileName(inputFile: string): string {
    inputFile = inputFile.replace(/\.gz$/i, '');
    inputFile = inputFile.replace(/\.(txt|trie)$/i, '');
    return `${inputFile}.btrie`;
}
