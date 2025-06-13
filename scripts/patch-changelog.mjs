#!/usr/bin/env node

// @ts-check

import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { checkWeAreInGitRepo, processChangeLog } from './lib/changelog.mjs';
import { fetchGitHubReleaseData } from './lib/fetch-release.mjs';

/**
 * @typedef {{ tag: string; token: string; debug?: boolean }} GitReleaseInfo
 */

const optionsToEnv = {
    tag: 'GITHUB_RELEASE_TAG',
    token: 'GITHUB_TOKEN',
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
 * @param {Partial<GitReleaseInfo>} releaseInfo
 * @returns {asserts releaseInfo is GitReleaseInfo}
 */
function checkArgs(releaseInfo) {
    let ok = true;
    for (const [key, envVar] of Object.entries(optionsToEnv)) {
        if (!releaseInfo[key]) {
            console.error(`Error: Option --${key} Environment variable ${envVar} is not set.`);
            ok = false;
        }
    }
    if (!ok) {
        throw new AppError('Environment variables check failed', 'ENV_CHECK_FAILED');
    }
}

const usage = `\
Usage: gen-release [options]

Downloads the release notes and patches the CHANGELOG.md file with the release data.

Options:
  -h, --help               Show this help message
  -t, --tag <tag>          Release tag (required if not set in env)
  -T, --token <token>      GitHub token (required if not set in env)
  -d, --debug              Enable debug mode
`;

async function processRelease() {
    console.error('Fetching release data...');

    const args = parseArgs({
        args: process.argv.slice(2),
        allowPositionals: true,
        options: {
            help: { type: 'boolean', short: 'h' },
            tag: { type: 'string', short: 't' },
            token: { type: 'string', short: 'T' },
            debug: { type: 'boolean', short: 'd' },
        },
    });

    if (args.values.help) {
        console.error('%s', usage);
        return;
    }

    await checkWeAreInGitRepo();

    const releaseInfo = {
        tag: args.values.tag ?? process.env.GITHUB_RELEASE_TAG,
        token: args.values.token ?? process.env.GITHUB_TOKEN,
        debug: args.values.debug ?? false,
    };

    checkArgs(releaseInfo);

    const files = args.positionals.length > 0 ? args.positionals : ['CHANGELOG.md'];

    for (const file of files) {
        const url = pathToFileURL(file);
        const fetchReleaseData = await fetchGitHubReleaseData(releaseInfo.token, releaseInfo.tag);
        const releaseData = {
            tag: fetchReleaseData.tag_name,
            body: fetchReleaseData.body,
            name: fetchReleaseData.name,
            version: fetchReleaseData.tag_name.match(/v?(\d+\.\d+\.\d+)/)?.[1] ?? fetchReleaseData.tag_name,
            date: fetchReleaseData.published_at?.split('T')?.[0] || fetchReleaseData.created_at.split('T')[0],
            debug: args.values.debug ?? false,
        };
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
