import * as Path from 'path';
import { exec, execAsync } from './sh';
import * as Config from './config';
import * as Shell from 'shelljs';
import * as fs from 'fs';
import { ShouldCheckOptions, shouldCheckRepo } from './shouldCheckRepo';
import { formatExecOutput, logWithPrefix } from './outputHelper';
import { Logger } from './types';
import simpleGit from 'simple-git';
import mkdirp from 'mkdirp';

export const repositoryDir = Path.resolve(Path.join(__dirname, '..', 'temp', 'repositories'));

const githubUrlRegexp = /^(git@github\.com:|https:\/\/github\.com\/).+$/i;

export function addRepository(url: string): boolean {
    if (!url || !githubUrlRegexp.test(url)) {
        return false;
    }
    const httpsUrl = url.replace('git@github.com:', 'https://github.com/');
    const relPath = httpsUrl
        .replace(/\.git$/, '')
        .split('/')
        .slice(3);
    const dir = Path.join(repositoryDir, ...relPath);
    const path = relPath.join('/');

    addToGit(dir, httpsUrl);
    Config.addRepository(path, httpsUrl);

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
    Shell.pushd('-q', path);
    const git = simpleGit(path);
    const pCheckout = git.checkout(commit, ['--force']);
    Shell.popd('-q');
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
        const c = await git.clone(url, path, [
            '--single-branch',
            '--no-checkout',
            `--depth=${depth}`,
            '--shallow-submodules',
        ]);
        log(`Cloned: ${c}`);
    } catch (e) {
        error(e);
        return false;
    }
    return true;
}

export async function updateRepositoryAsync(prefix: string, path: string, useRemote = false): Promise<boolean> {
    if (!path || !fs.existsSync(Path.join(repositoryDir, path))) {
        if (path) {
            console.log(`${prefix}Repository: '${path}' not found.`);
        }
        return Promise.resolve(false);
    }
    const remote = useRemote ? '--remote' : '';
    const init = useRemote ? '' : '--init';
    const command = `git submodule update --depth 1 ${remote} ${init} -- ${JSON.stringify(path)}`;
    logWithPrefix(prefix, command);
    Shell.pushd('-q', repositoryDir);
    const r = execAsync(command, { echo: false, bail: false });
    Shell.popd('-q');
    const output = formatExecOutput(await r);
    if (output) {
        logWithPrefix(prefix, output);
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

function addToGit(dir: string, url: string) {
    const p = Path.dirname(dir);
    Shell.mkdir('-p', p);
    Shell.pushd(p);
    exec(`git submodule add --depth 1 ${JSON.stringify(url)}`, {
        echo: true,
        bail: true,
    });
    Shell.popd();
}
