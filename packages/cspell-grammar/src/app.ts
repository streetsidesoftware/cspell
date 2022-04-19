import { TypeScript } from './grammars';
import { NGrammar } from './parser/grammarNormalized';
import { normalizeGrammar } from './parser/grammarNormalizer';
import * as path from 'path';
import { promises as fs } from 'fs';
import { parseDocument } from './parser/parser';

const grammars: Record<string, NGrammar | undefined> = {
    '.ts': normalizeGrammar(TypeScript.grammar),
};

/**
 * Run simple parser
 * @param args -- command line arguments
 * @returns Promise
 */
export async function run(args: string[]): Promise<void> {
    console.log('args: %o', args);
    // early out if there are not enough arguments
    if (args.length < 3) {
        console.log('usage...');
        return;
    }

    const filename = args.slice(2).filter((p) => !p.startsWith('-'))[0];
    if (!filename) {
        console.log('filename missing');
        return;
    }

    const ext = path.extname(filename);
    const g = grammars[ext];
    if (!g) {
        console.log(`No grammar for ${path.basename(filename)}`);
        return;
    }

    console.log(`File: ${path.basename(filename)} Grammar: ${g.name || g.scopeName}`);
    const content = await fs.readFile(filename, 'utf-8');

    parseDocument(g, filename, content);
}
