import * as Shell from 'shelljs';
import * as Path from 'path';
import { config } from './config';
import { Repository } from './configDef';
import { exec } from './sh';
import { repositoryDir } from './repositoryHelper';


const cspell = require.resolve('cspell/bin.js');
const cspellCommand = 'node ' + JSON.stringify(cspell);

function execCheck(rep: Repository) {
    const name = rep.name || rep.path;
    const path = Path.join(repositoryDir, rep.path);
    console.log(`Checking '${name}'...`);
    const cspellResult = execCommand(path, cspellCommand, rep.args);
    console.log(cspellResult);
}

function execCommand(dir: string, command: string, args: string[]) {
    const argv = args.map(a => JSON.stringify(a)).join(' ');
    const fullCommand = command + ' ' + argv;
    Shell.pushd(dir);
    console.log(`Execute: '${fullCommand}'`)
    const result = exec(fullCommand);
    Shell.popd();
    return result;
}

export function check() {
    exec("git submodule init", { echo: true, bail: true });
    config.repositories.forEach(execCheck);
}
