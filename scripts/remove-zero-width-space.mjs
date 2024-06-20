#!/usr/bin/env node

// @ts-check
import fs from 'node:fs/promises';

const usage = `
Usage:
remove-zero-width <path>

Removes zero width spaces from a file.
`;

async function run() {
    const argv = process.argv;

    const path = argv[2];

    if (argv.includes('--help') || !path) {
        console.error(usage);
        process.exitCode = 1;
    }

    const content = await fs.readFile(path, 'utf8');
    await fs.writeFile(path, content.replaceAll('\u200B', ''));
}

run();
