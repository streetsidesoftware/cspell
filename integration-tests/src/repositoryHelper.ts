import * as Path from 'path';
import { exec } from './sh';
import * as Shell from 'shelljs';
import * as fs from 'fs';

export const repositoryDir = Path.resolve(Path.join(__dirname, '..', 'repositories'));

const githubUrlRegexp = /^(git@github\.com:|https:\/\/github\.com\/).+$/i

export function addRepository(url: string): boolean {
    if (!url || !githubUrlRegexp.test(url)) {
        return false;
    }
    const httpsUrl = url.replace('git@github.com:', 'https://github.com/')
    const owner = Path.basename(Path.dirname(url));
    const dir = Path.join(repositoryDir, owner);

    Shell.mkdir(dir);
    Shell.pushd(dir);
    exec(`git submodule add --depth 1 ${JSON.stringify(url)}`, { echo: true, bail: true });
    Shell.popd();
    return true;
}

export function updateRepository(path: string | undefined = ''): boolean {
    path = path.replace(/^repositories/, '');

    if (!path || !fs.existsSync(Path.join(repositoryDir, path))) {
        if (path) {
            console.log(`Repository: '${path}' not found.`)
        }
        return false;
    }
    const submodule = Path.join(repositoryDir, path);
    exec(`git submodule update --depth 1 --remote -- ${JSON.stringify(submodule)}`, { echo: true, bail: true });

    return true;
}
