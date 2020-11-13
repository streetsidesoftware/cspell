import * as Path from 'path';
import { exec, execAsync } from './sh';
import * as Config from './config';
import * as Shell from 'shelljs';
import * as fs from 'fs';
import { ShouldCheckOptions, shouldCheckRepo } from './shouldCheckRepo';
import { formatExecOutput, logWithPrefix } from './outputHelper';

export const repositoryDir = Path.resolve(Path.join(__dirname, '..', 'repositories'));

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

export function updateRepository(path: string | undefined = '', useRemote = false): boolean {
    path = path.replace(/^repositories/, '');

    if (!path || !fs.existsSync(Path.join(repositoryDir, path))) {
        if (path) {
            console.log(`Repository: '${path}' not found.`);
        }
        return false;
    }
    const remote = useRemote ? '--remote' : '';
    const init = useRemote ? '' : '--init';
    Shell.pushd('-q', repositoryDir);
    exec(`git submodule update --depth 1 ${remote} ${init} -- ${JSON.stringify(path)}`, { echo: true, bail: true });
    Shell.popd('-q');

    return true;
}

export async function updateRepositoryAsync(prefix: string, path: string, useRemote = false): Promise<boolean> {
    path = path.replace(/^repositories/, '');

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

export function listRepositories(options: ListRepositoryOptions) {
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
    exec(`git submodule add --depth 1 ${JSON.stringify(url)}`, { echo: true, bail: true });
    Shell.popd();
}
