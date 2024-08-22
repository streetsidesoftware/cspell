#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

import { fetchContributors } from './fetch-contributors.mjs';

const token = process.argv[2] || (await getToken());

const outputFileUrl = new URL('../static/contributors.md', import.meta.url);

async function getToken() {
    const stdout = execSync('gh auth token').toString();
    return stdout.trim();
}

/**
 *
 * @param {Contributor} contributor
 * @returns string
 */
function contributorToMd(contributor) {
    return `[<img alt="Contributor ${contributor.login}" src="${contributor.avatar_url}&size=128" width=64>](${contributor.html_url})`;
}

/**
 *
 * @param {Contributor[]} contributors
 * @returns string
 */
function contributorsToMd(contributors) {
    return '<--- cspell:disable --->\n' + contributors.map(contributorToMd).join('\n') + '\n<--- cspell:enable --->\n';
}

async function run() {
    if (!token) {
        throw new Error('GitHub token is required');
    }

    const contributors = await fetchContributors(token);

    await writeFile(outputFileUrl, contributorsToMd(contributors));
}

run();
