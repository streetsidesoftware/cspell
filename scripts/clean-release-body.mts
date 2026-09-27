/*
 * Clean a draft release's notes: remove hidden comments and "For maintainers" blocks from each PR body.
 * Usage: node ./scripts/clean-release-body.mts --tag <tag> [--repo <owner/name>] [--update] [--output <file>]
 *   --update  Write the cleaned notes back to the draft release.
 *   --output  Write the cleaned notes to a file instead of stdout.
 * Needs `gh`, authenticated (GH_TOKEN in CI).
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseArgs, promisify } from 'node:util';

import { cleanReleaseBody } from './lib/clean-release-body.mts';

const run = promisify(execFile);

interface Release {
    id: number;
    tag_name: string;
    draft: boolean;
    body: string | null;
}

async function gh(args: string[]): Promise<string> {
    const { stdout } = await run('gh', args, { maxBuffer: 64 * 1024 * 1024 });
    return stdout;
}

async function findDraftRelease(repo: string, tag: string): Promise<Release> {
    const releases = JSON.parse(await gh(['api', `repos/${repo}/releases?per_page=100`])) as Release[];
    const release = releases.find((r) => r.draft && r.tag_name === tag);
    if (!release) throw new Error(`No draft release with tag ${tag} in ${repo}.`);
    return release;
}

async function getPullRequestBody(repo: string, prNumber: number): Promise<string> {
    const pr = JSON.parse(await gh(['api', `repos/${repo}/pulls/${prNumber}`])) as { body: string | null };
    return pr.body ?? '';
}

async function updateRelease(repo: string, id: number, body: string): Promise<void> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'release-body-'));
    const input = path.join(dir, 'body.json');
    await fs.writeFile(input, JSON.stringify({ body }));
    await gh(['api', '-X', 'PATCH', `repos/${repo}/releases/${id}`, '--input', input]);
    await fs.rm(dir, { recursive: true });
}

async function main(): Promise<void> {
    const { values } = parseArgs({
        options: {
            tag: { type: 'string' },
            repo: { type: 'string', default: process.env.GITHUB_REPOSITORY || 'streetsidesoftware/cspell' },
            update: { type: 'boolean', default: false },
            output: { type: 'string' },
        },
    });
    if (!values.tag)
        throw new Error('Usage: node ./scripts/clean-release-body.mts --tag <tag> [--update] [--output <file>]');

    const repo = values.repo;
    const release = await findDraftRelease(repo, values.tag);
    const { body, cleaned } = await cleanReleaseBody(release.body ?? '', (n) => getPullRequestBody(repo, n));

    console.error(
        cleaned.length ? `Cleaned the bodies of ${cleaned.map((n) => `#${n}`).join(', ')}.` : 'Nothing to clean.',
    );
    if (values.update && cleaned.length) {
        await updateRelease(repo, release.id, body);
        console.error(`Updated the draft release ${values.tag}.`);
    }
    if (values.output) {
        await fs.writeFile(values.output, body);
    } else {
        process.stdout.write(body);
    }
}

try {
    await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
