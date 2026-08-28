#!/usr/bin/env node

/*
 * Set the release mode for the project.
 * Usage: node ./scripts/set-release-mode.mts <mode>
 * Where <mode> can be "release" or "prerelease".
 * Example: node ./scripts/set-release-mode.mts release
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import { parseDocument } from 'yaml';

const __dirname = import.meta.dirname;

const releaseDrafterConfigFile = path.join(__dirname, '../.github/release-drafter.yml');

const prereleaseModes = ['true', 'false'] as const;
type PrereleaseMode = (typeof prereleaseModes)[number];

class AppError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AppError';
    }
}

function isReleaseMode(mode: string): mode is PrereleaseMode {
    return (prereleaseModes as readonly string[]).includes(mode);
}

function parseMode(argv: string[]): PrereleaseMode {
    const mode = argv[2];
    if (!mode || !isReleaseMode(mode)) {
        throw new AppError(`Usage: node ./scripts/set-prerelease-mode.mts < ${prereleaseModes.join(' | ')} >`);
    }
    return mode;
}

async function setReleaseMode(mode: PrereleaseMode): Promise<void> {
    const content = await fs.readFile(releaseDrafterConfigFile, 'utf8');
    const doc = parseDocument(content);
    doc.set('prerelease', mode === 'true');
    await fs.writeFile(releaseDrafterConfigFile, doc.toString(), 'utf8');
}

async function run(): Promise<void> {
    try {
        const mode = parseMode(process.argv);
        await setReleaseMode(mode);
        console.log(`Set prerelease mode to "${mode}" in ${path.relative(process.cwd(), releaseDrafterConfigFile)}`);
    } catch (error) {
        if (error instanceof AppError) {
            console.error(error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        process.exitCode = 1;
    }
}

run();
