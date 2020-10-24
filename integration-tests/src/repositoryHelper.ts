import * as Path from 'path';
import { exec } from './sh';
import * as Shell from 'shelljs';

export const repositoryDir = Path.resolve(Path.join(__dirname, '..', 'repositories'));

export function addRepository(url: string) {
    const owner = Path.basename(Path.dirname(url));
    const dir = Path.join(repositoryDir, owner);

    Shell.mkdir(dir);
    Shell.pushd(dir);
    exec(`git submodule add --depth 1 ${JSON.stringify(url)}`);
    Shell.popd();
}
