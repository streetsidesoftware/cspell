import * as Path from 'path';
import * as Config from './config';
import * as fs from 'fs';
import { ShouldCheckOptions, shouldCheckRepo } from './shouldCheckRepo';
import { Logger } from './types';
import simpleGit from 'simple-git';
import mkdirp from 'mkdirp';
import { Octokit } from '@octokit/rest';

export const repositoryDir = Path.resolve(Path.join(__dirname, '../repositories/temp'));

const githubUrlRegexp = /^(git@github\.com:|https:\/\/github\.com\/).+$/i;

export async function addRepository(logger: Logger, url: string): Promise<boolean> {
    if (!url || !githubUrlRegexp.test(url)) {
        return false;
    }

    const httpsUrl = url.replace('git@github.com:', 'https://github.com/');
    const relPath = httpsUrl
        .replace(/\.git$/, '')
        .split('/')
        .slice(3);
    const [owner, repo] = relPath;
    const path = relPath.join('/');

    try {
        const octokit = new Octokit();
        const r = await octokit.repos.get({ owner, repo });
        const branch = r.data.default_branch;

        const b = await octokit.repos.getBranch({ owner, repo, branch });

        Config.addRepository(path, httpsUrl, b.data.commit.sha || branch);
    } catch (e) {
        logger.error(e);
        return false;
    }

    return true;
}

export async function checkoutRepositoryAsync(
    logger: Logger,
    url: string,
    path: string,
    commit: string | undefined
): Promise<boolean> {
    const { log, error } = logger;
    path = Path.resolve(Path.join(repositoryDir, path));
    commit = commit || 'master';
    if (!fs.existsSync(path)) {
        const c = await cloneRepo(logger, url, path, commit === 'master' ? 1 : 1000);
        if (!c) {
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
    depth: number | undefined
): Promise<boolean> {
    depth = depth || 1;
    log(`Cloning ${url}`);
    await mkdirp(Path.dirname(path));
    try {
        const git = simpleGit();
        const c = await git.clone(url, path, ['--single-branch', '--no-checkout', `--depth=${depth}`]);
        log(`Cloned: ${c}`);
    } catch (e) {
        error(e);
        return false;
    }
    return true;
}

export type ListRepositoryOptions = ShouldCheckOptions;

export function listRepositories(options: ListRepositoryOptions): void {
    const config = Config.readConfig();
    config.repositories
        .filter((rep) => shouldCheckRepo(rep, options))
        .forEach((rep) => {
            console.log(rep.path);
        });
}
