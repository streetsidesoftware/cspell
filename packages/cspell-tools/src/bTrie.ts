import { writeFile } from 'node:fs/promises';

import { createBTrieFromFile } from './compiler/bTrie.js';

export function generateBTrie(files: string[]): Promise<void> {
    return generateBTrieFromFiles(files);
}

async function generateBTrieFromFiles(files: string[]): Promise<void> {
    console.log(`Generating BTrie for ${files.length} file(s).`);
    for (const file of files) {
        console.log(`Processing file: ${file}`);
        const btrie = await createBTrieFromFile(file);
        const outFile = bTrieFileName(file);
        await writeFile(outFile, btrie);
        console.log(`Written BTrie to: ${outFile}`);
    }
}

function bTrieFileName(inputFile: string): string {
    inputFile = inputFile.replace(/\.gz$/i, '');
    inputFile = inputFile.replace(/\.(txt|trie)$/i, '');
    return `${inputFile}.btrie`;
}
