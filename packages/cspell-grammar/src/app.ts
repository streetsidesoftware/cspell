import type { ParsedText, Parser } from '@cspell/cspell-types/Parser';
import { promises as fs } from 'fs';
import * as path from 'path';
import { parser as parserTypeScript } from './parsers/typescript';

const parsers: Record<string, Parser> = {
    '.ts': parserTypeScript,
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
    const parser = parsers[ext];
    if (!parser) {
        console.log(`No parser for ${path.basename(filename)}`);
        return;
    }

    console.log(`File: ${path.basename(filename)} Parser: ${parser.name}`);
    const content = await fs.readFile(filename, 'utf-8');

    const result = parser.parse(content, filename);
    for (const pt of result.parsedTexts) {
        emit(pt);
    }
}

function emit(pt: ParsedText) {
    const t = pt.text.replace(/\t/g, '↦').replace(/\r?\n/g, '↩︎').replace(/\r/g, '⇠');
    console.log(`${pt.range[0]}-${pt.range[1]}\t${t}\t${pt.scope?.toString() || ''}`);
}
