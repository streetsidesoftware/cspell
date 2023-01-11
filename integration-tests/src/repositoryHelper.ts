import * as fs from 'fs';
import * as Path from 'path';
import { Octokit } from '@octokit/rest';
import Chalk from 'chalk';
import mkdirp from 'mkdirp';
import { simpleGit } from 'simple-git';

import * as Config from './config';
import type { Repository } from './configDef';
import type { ShouldCheckOptions } from './shouldCheckRepo';
import { shouldCheckRepo } from './shouldCheckRepo';
import type { Logger } from './types';

export const repositoryDir = Path.resolve(Path.join(__dirname, '../repositories/temp'));

const minCommitDepth = 10; // To handle race condition with respect to commits.

const githubUrlRegexp = /^(git@github\.com:|https:\/\/github\.com\/).+$/i;

export async function addRepository(
    logger: Logger,
    url: string,
    branch: string | undefined
): Promise<Repository | undefined> {
    if (!url || !githubUrlRegexp.test(url)) {
        return undefined;
    }

    const httpsUrl = url.replace('git@github.com:', 'https://github.com/');

    try {
        const repoInfo = fetchRepositoryInfoForRepo(httpsUrl);
        const { path, url, commit } = await repoInfo;
        return Config.addRepository(path, url, branch || commit, branch);
    } catch (e) {
        logger.error(e);
        return undefined;
    }
}

interface RepositoryInfo {
    path: string;
    url: string;
    commit: string;
    defaultBranch: string;
}

export async function fetchRepositoryInfoForRepo(url: string): Promise<RepositoryInfo> {
    const httpsUrl = url.replace('git@github.com:', 'https://github.com/');
    const relPath = httpsUrl
        .replace(/\.git$/, '')
        .split('/')
        .slice(3);
    const [owner, repo] = relPath;
    const path = relPath.join('/');

    const octokit = getOctokit();
    const r = await octokit.repos.get({ owner, repo });
    const branch = r.data.default_branch;

    const b = await octokit.repos.getBranch({ owner, repo, branch });

    return {
        path,
        url: httpsUrl,
        commit: b.data.commit.sha || branch,
        defaultBranch: branch,
    };
}

export async function checkoutRepositoryAsync(
    logger: Logger,
    url: string,
    path: string,
    commit: string,
    branch: string | undefined
): Promise<boolean> {
    const { log, error } = logger;
    path = Path.resolve(Path.join(repositoryDir, path));
    if (!fs.existsSync(path)) {
        try {
            const repoInfo = await fetchRepositoryInfoForRepo(url);
            const c = await cloneRepo(
                logger,
                url,
                path,
                commit === repoInfo.commit ? minCommitDepth : undefined,
                !branch || branch === repoInfo.defaultBranch
            );
            if (!c) {
                return false;
            }
        } catch (e) {
            error(e);
            return false;
        }
    }
    log(`checkout ${url}`);
    const git = simpleGit(path);
    const pCheckout = git.checkout(commit, ['--force']);
    git.log();
    try {
        const r = await pCheckout;
        log(`checked out ${r}`);
    } catch (e) {
        error(e);
        return false;
    }
    return true;
}

async function cloneRepo(
    { log, error }: Logger,
    url: string,
    path: string,
    depth: number | undefined,
    useSingleBranch: boolean
): Promise<boolean> {
    log(`Cloning ${url} depth: ${depth || 'unlimited'}`);
    await mkdirp(Path.dirname(path));
    const options = ['--no-checkout'];
    if (depth) {
        options.push(`--depth=${depth}`);
    }
    if (useSingleBranch) {
        options.push('--single-branch');
    }
    try {
        const git = simpleGit();
        const c = await git.clone(url, path, options);
        log(`Cloned: ${c} with options: ${options.join(' ')}`);
    } catch (e) {
        error(e);
        return false;
    }
    return true;
}

export interface ListRepositoryOptions extends ShouldCheckOptions {
    /**
     * Output in JSON List format
     */
    json?: boolean;

    /**
     * List ONLY dirty
     */
    dirty?: boolean;

    /**
     * Indicate that a repository is stale.
     */
    showIsDirty?: boolean;
}

export async function listRepositories(options: ListRepositoryOptions): Promise<void> {
    const showDirty = options.showIsDirty ?? true;
    const config = Config.readConfig();
    const pValues = config.repositories
        .filter((rep) => shouldCheckRepo(rep, options))
        .map(async (rep) => {
            const info = await fetchRepositoryInfoForRepo(rep.url);
            return {
                ...rep,
                dirty: rep.commit !== info.commit,
                head: info.commit,
            };
        });

    const compare = new Intl.Collator().compare;
    const values = (await Promise.all(pValues)).sort((a, b) => compare(a.path, b.path));

    const dirty = new Set(values.filter((r) => r.dirty).map((r) => r.path));
    const paths = options.dirty ? [...dirty] : values.map((r) => r.path);

    if (options.json) {
        console.log(JSON.stringify(paths));
        return;
    }

    paths.forEach((path) => {
        if (showDirty && dirty.has(path)) {
            console.log(Chalk.red`${path} *`);
        } else {
            console.log(path);
        }
    });
}

function getOctokit(auth?: string | undefined): Octokit {
    auth = auth || process.env['GITHUB_TOKEN'] || undefined;
    const options = auth ? { auth } : undefined;
    return new Octokit(options);
}
