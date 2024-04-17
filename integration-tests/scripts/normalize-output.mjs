#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';

/**
 *
 * @param {string} content
 * @return {string}
 */
function normalize(content) {
    content = content.replace(/\r/g, '');
    content = content.replace(/^\s*\d+\/\d+/gm, '');
    content = content.replace(/\n\n/g, '\n');
    content = content.replace(/[\d.]+ms/g, ' ms');
    return content;
}

async function normalizeFile(inFilename) {
    const outFilename = path.join(path.dirname(inFilename), path.basename(inFilename, '.txt') + '.n.txt');
    const content = await readFile(inFilename, 'utf8');
    await writeFile(outFilename, normalize(content), 'utf8');
}

/**
 *
 * @param {string[]} files
 */
async function processFiles(files) {
    const pending = files.map((file) => normalizeFile(file));
    await Promise.all(pending);
}

const usage = `
Normalize the stderr output from cspell lint so the output can be compared.

Usage:
normalize-output <filename> [filename]
`;

async function main() {
    const args = process.argv.slice(2);

    if (!args[0] || args[0] === '--help') {
        console.log(usage);
        return;
    }

    await processFiles(args);
}

main();
