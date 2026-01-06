#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

import type { Contributor } from './lib/fetch-contributors.mts';
import { fetchContributors, normalizeContributorFields } from './lib/fetch-contributors.mts';

const token = process.argv[2] || (await getToken());

const outputFileUrl = new URL('../static/contributors.md', import.meta.url);
const outputJsonUrl = new URL('../website/_static/contributors.json', import.meta.url);

async function getToken() {
    const stdout = execSync('gh auth token').toString();
    return stdout.trim();
}

/**
 *
 * @param {Contributor} contributor
 * @returns string
 */
function contributorToMd(contributor: Contributor): string {
    return `[<img alt="Contributor ${contributor.login}" src="${contributor.avatar_url}&size=128" width=64>](${contributor.html_url})`;
}

const regExpContribUrl = /\((https:\/\/github\.com\/.*)\)/;

/**
 *
 * @param {Contributor[]} contributors
 * @param {string} currentContributorsMd
 * @returns string
 */
function contributorsToMd(contributors: Contributor[], currentContributorsMd: string): string {
    const existingContributorsMd = currentContributorsMd
        .split('\n')
        .map((line) => [line.match(regExpContribUrl)?.[1], line] as const)
        .filter((line) => line[0]);
    const existing = new Map(existingContributorsMd);

    // Remove new ones from the existing list
    contributors.forEach((contributor) => existing.delete(contributor.html_url));

    const contributorsMd = [...contributors.map(contributorToMd), ...existing.values()];

    return '<!--- cspell:disable --->\n\n' + contributorsMd.join('\n') + '\n\n<!--- cspell:enable --->\n';
}

async function writeContributorsJson(contributors: Contributor[]): Promise<void> {
    await mkdir(new URL('.', outputJsonUrl), { recursive: true });
    await writeFile(outputJsonUrl, JSON.stringify({ contributors }, undefined, 4));
}

async function readExistingContributors(): Promise<Contributor[]> {
    const content = await readFile(outputJsonUrl, 'utf-8').catch(() => undefined);
    if (!content) return [];
    return (JSON.parse(content) || {}).contributors || [];
}

function mergeContributors(existing: Contributor[], incoming: Contributor[]): Contributor[] {
    const mapExisting = new Map(existing.map((c) => [c.login, c] as const));
    const mapUpdated = new Map<string, Contributor>();

    for (const c of incoming) {
        const count = mapExisting.get(c.login)?.contributions || 0;
        if (c.contributions > count) {
            mapUpdated.set(c.login, c);
        }
    }

    for (const c of mapExisting.values()) {
        if (mapUpdated.has(c.login)) continue;
        mapUpdated.set(c.login, c);
    }

    return [...mapUpdated.values()];
}

function needToUpdate(existing: Contributor[], updated: Contributor[]): boolean {
    const existingLogins = existing.map((c) => c.login);
    const updatedLogins = updated.map((c) => c.login);
    return !existingLogins.every((v, i) => v === updatedLogins[i]);
}

async function run() {
    if (!token) {
        throw new Error('GitHub token is required');
    }

    console.log('Fetching Contributors from GitHub');
    const fetchedContributors = (await fetchContributors(token)).map(normalizeContributorFields);

    console.log('Reading existing Contributors');
    const existing = await readExistingContributors();

    console.log('Merging Contributors');
    const contributors = mergeContributors(existing, fetchedContributors);

    const shouldUpdate = needToUpdate(existing, contributors);

    if (!shouldUpdate) {
        console.log('No changes.');
        return;
    }

    console.log('Updating Markdown');
    const existingContributorsMd = await readFile(outputFileUrl, 'utf8').catch(() => '');

    await writeFile(outputFileUrl, contributorsToMd(contributors, existingContributorsMd));

    console.log('Updating JSON');
    await writeContributorsJson(contributors);

    console.log('done.');
}

run();
