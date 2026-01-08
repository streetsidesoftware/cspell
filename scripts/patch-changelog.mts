#!/usr/bin/env node

// @ts-check

import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { checkWeAreInGitRepo, processChangeLog } from './lib/changelog.mts';
import { fetchGitHubReleaseData } from './lib/fetch-release.mts';

interface GitReleaseInfo {
    tag: string;
    token: string;
    debug?: boolean;
}

const optionsToEnv = {
    tag: 'GITHUB_RELEASE_TAG',
    token: 'GITHUB_TOKEN',
} as const satisfies GitReleaseInfo;

class AppError extends Error {
    code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = 'AppError';
        this.code = code;
    }
}

// cspell:ignore mdast

function checkArgs(releaseInfo: Partial<GitReleaseInfo>): asserts releaseInfo is GitReleaseInfo {
    let ok = true;
    for (const [key, envVar] of Object.entries(optionsToEnv) as [keyof GitReleaseInfo, string][]) {
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
Usage: patch-changelog [options] [CHANGELOG.md]

Downloads the release notes and patches the CHANGELOG.md file with the release data.

Options:
  -h, --help               Show this help message
  -t, --tag <tag>          Release tag, can be used multiple times (default: latest)
  -T, --token <token>      GitHub token (required if not set in env)
  -s, --summarize          Summarize the release notes
  -d, --debug              Enable debug mode
`;

async function processRelease() {
    console.error('Fetching release data...');

    const args = parseArgs({
        args: process.argv.slice(2),
        allowPositionals: true,
        options: {
            help: { type: 'boolean', short: 'h' },
            tag: { type: 'string', short: 't', multiple: true },
            token: { type: 'string', short: 'T' },
            summarize: { type: 'boolean', short: 's' },
            debug: { type: 'boolean', short: 'd' },
        },
    });

    if (args.values.help) {
        console.error('%s', usage);
        return;
    }

    await checkWeAreInGitRepo();

    const tags = args.values.tag?.length ? args.values.tag : [process.env.GITHUB_RELEASE_TAG || 'latest'];

    const baseReleaseInfo = {
        tag: tags[0],
        token: args.values.token ?? process.env.GITHUB_TOKEN,
        debug: args.values.debug ?? false,
        summarize: args.values.summarize ?? false,
        repoUrl: new URL('https://github.com/streetsidesoftware/cspell/'),
        apiUrl: new URL('https://api.github.com/repos/streetsidesoftware/cspell/'),
    };

    checkArgs(baseReleaseInfo);

    for (const tag of tags) {
        const releaseInfo = { ...baseReleaseInfo, tag };
        const files = args.positionals.length > 0 ? args.positionals : ['CHANGELOG.md'];
        const fetchReleaseData = await fetchGitHubReleaseData(releaseInfo);

        for (const file of files) {
            const url = pathToFileURL(file);
            const releaseData = {
                ...releaseInfo,
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
