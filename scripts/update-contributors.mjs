#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

import { fetchContributors } from './lib/fetch-contributors.mjs';

/**
 * @import { Contributor } from './lib/fetch-contributors.mjs';
 */

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

const regExpContribUrl = /\((https:\/\/github\.com\/.*)\)/;

/**
 *
 * @param {Contributor[]} contributors
 * @param {string} currentContributorsMd
 * @returns string
 */
function contributorsToMd(contributors, currentContributorsMd) {
    const existingContributorsMd = currentContributorsMd
        .split('\n')
        .map((line) => [line.match(regExpContribUrl)?.[1], line])
        .filter((line) => line[0]);
    const existing = new Map(existingContributorsMd);

    // Remove new ones from the existing list
    contributors.forEach((contributor) => existing.delete(contributor.html_url));

    const contributorsMd = [...contributors.map(contributorToMd), ...existing.values()];

    return '<!--- cspell:disable --->\n\n' + contributorsMd.join('\n') + '\n\n<!--- cspell:enable --->\n';
}

async function run() {
    if (!token) {
        throw new Error('GitHub token is required');
    }

    const contributors = await fetchContributors(token);

    const existingContributorsMd = await readFile(outputFileUrl, 'utf8').catch(() => '');

    await writeFile(outputFileUrl, contributorsToMd(contributors, existingContributorsMd));
}

run();
