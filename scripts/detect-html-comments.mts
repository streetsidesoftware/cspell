/*
 * Report HTML comments in Markdown: text that GitHub doesn't show. Comments in a well-formed fenced code block are the
 * only exception, so a cspell directive shown in one isn't reported.
 * Usage: node ./scripts/detect-html-comments.mts [--show] [file ...]
 *   With no files, or `-`, reads stdin.
 *   --show  Also print each comment's text, escaped. Not for CI logs: that's the hidden text.
 * Exit codes: 0 none found, 2 comments found, 1 error. Node's own failures also exit 1, and Node never uses 2.
 */

import fs from 'node:fs/promises';
import { parseArgs } from 'node:util';

import { findHtmlComments, formatHtmlComment } from './lib/html-comments.mts';

async function readStdin(): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<number> {
    const { values, positionals } = parseArgs({
        options: { show: { type: 'boolean', default: false } },
        allowPositionals: true,
    });
    const names = positionals.length ? positionals : ['-'];

    let found = 0;
    for (const name of names) {
        const text = name === '-' ? await readStdin() : await fs.readFile(name, 'utf8');
        for (const comment of findHtmlComments(text)) {
            ++found;
            console.log(formatHtmlComment(name === '-' ? '<stdin>' : name, comment));
            if (values.show) console.log(`    ${JSON.stringify(comment.text)}`);
        }
    }
    if (!found) console.log('No HTML comments found.');
    return found ? 2 : 0;
}

try {
    process.exitCode = await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
