#!/usr/bin/env node

// @ts-check

import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { checkWeAreInGitRepo, processChangeLog } from './lib/changelog.mjs';

/**
 * @typedef {{ tag: string; body: string; name: string; version: string; debug?: boolean }} ReleaseData
 */

const optionsToEnv = {
    tag: 'GITHUB_RELEASE_TAG',
    body: 'GITHUB_RELEASE_BODY',
    name: 'GITHUB_RELEASE_NAME',
    version: 'GITHUB_RELEASE_VERSION',
};

class AppError extends Error {
    /**
     *
     * @param {string} message
     * @param {string | undefined} [code]
     */
    constructor(message, code) {
        super(message);
        this.name = 'AppError';
        this.code = code;
    }
}

// cspell:ignore mdast

/**
 *
 * @param {Partial<ReleaseData>} releaseData
 * @returns {asserts releaseData is ReleaseData}
 */
function checkArgs(releaseData) {
    let ok = true;
    for (const [key, envVar] of Object.entries(optionsToEnv)) {
        if (!releaseData[key]) {
            console.error(`Error: Option --${key} Environment variable ${envVar} is not set.`);
            ok = false;
        }
    }
    if (!ok) {
        throw new AppError('Environment variables check failed', 'ENV_CHECK_FAILED');
    }
}

/**
 * @param {ReleaseData} releaseData
 * @return {Promise<void>}
 */
async function updateVersionFile(releaseData) {
    const { tag, name, version } = releaseData;
    await fs.writeFile('release.json', JSON.stringify({ name, version, tag }, undefined, 4) + '\n', 'utf8');
}

const usage = `\
Usage: gen-release [options]
Options:
  -h, --help               Show this help message
  -t, --tag <tag>          Release tag (required if not set in env)
  -b, --body <body>        Release body (required if not set in env)
  -n, --name <name>        Release name (required if not set in env)
  -v, --version <version>  Release version (required if not set in env)
  -D, --date <date>        Release date (defaults to today)
  -d, --debug              Enable debug mode
`;

async function processRelease() {
    console.error('Generating release data...');

    const args = parseArgs({
        args: process.argv.slice(2),
        allowPositionals: true,
        options: {
            help: { type: 'boolean', short: 'h' },
            tag: { type: 'string', short: 't' },
            body: { type: 'string', short: 'b' },
            name: { type: 'string', short: 'n' },
            version: { type: 'string', short: 'v' },
            date: { type: 'string', short: 'D' },
            debug: { type: 'boolean', short: 'd' },
        },
    });

    if (args.values.help) {
        console.error('%s', usage);
        return;
    }

    await checkWeAreInGitRepo();

    const releaseData = {
        tag: args.values.tag ?? process.env.GITHUB_RELEASE_TAG,
        body: args.values.body ?? process.env.GITHUB_RELEASE_BODY,
        name: args.values.name ?? process.env.GITHUB_RELEASE_NAME,
        version: args.values.version ?? process.env.GITHUB_RELEASE_VERSION,
        date: args.values.date ?? new Date().toISOString().split('T')[0],
        debug: args.values.debug ?? false,
        repoUrl: new URL('https://github.com/streetsidesoftware/cspell/'),
        apiUrl: new URL('https://api.github.com/repos/streetsidesoftware/cspell/'),
    };

    checkArgs(releaseData);

    await updateVersionFile(releaseData);

    const files = args.positionals.length > 0 ? args.positionals : ['CHANGELOG.md'];

    for (const file of files) {
        const url = pathToFileURL(file);
        await processChangeLog(url, releaseData);
    }
}

async function run() {
    try {
        await processRelease();
    } catch (error) {
        if (error instanceof AppError) {
            console.error(`AppError: \n  ${error.message}`);
        } else {
            console.error('Unexpected error:', error);
        }
        process.exitCode = 1;
    }
}

run();
