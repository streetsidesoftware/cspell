import * as Shell from 'shelljs';
import * as Path from 'path';
import { config } from './config';
import { Repository } from './configDef';
import { exec } from './sh';
import { repositoryDir } from './repositoryHelper';


const cspell = require.resolve('cspell/bin.js');
const cspellCommand = 'node ' + JSON.stringify(cspell);
const cspellCurrent = 'node ' + Path.resolve(__dirname, '..', '..', 'bin.js')

interface Result {
    stdout: string;
    stderr: string;
    code: number;
}

function execCheck(rep: Repository) {
    const name = rep.name || rep.path;
    const path = Path.join(repositoryDir, rep.path);
    console.log(`
Checking '${name}'...
`);
    const cspellResult = execCommand(path, cspellCommand, rep.args);
    logResult(cspellResult);
    const newResult = execCommand(path, cspellCurrent, rep.args);
    logResult(newResult);
    return compare(cspellResult, newResult);
}

function execCommand(dir: string, command: string, args: string[]) {
    const argv = args.map(a => JSON.stringify(a)).join(' ');
    const fullCommand = command + ' ' + argv;
    Shell.pushd('-q', dir);
    console.log(`Execute: '${fullCommand}'`)
    const result = exec(fullCommand);
    Shell.popd('-q', '+0');
    return result;
}

function logResult(result: Result) {
    const { stdout, stderr, code } = result;
    console.log(`${stdout} ${stderr} exit code: ${code}`)
}

function compare(a: Result, b: Result): boolean {
    return a.code === b.code
    && a.stderr === b.stderr
    && a.stdout === b.stdout
}

export function check() {
    exec('git submodule update --init --recursive --depth 1', { echo: true, bail: true });
    const failed = config.repositories.filter(rep => !execCheck(rep));
    if (failed.length) {
        const failedChecks = failed
            .map(rep => rep.name || rep.path)
            .map(name => `\t "${name}"`)
            .join('\n')
        const msg = `
Some checks failed:
${failedChecks}
`;
        console.error(msg);
        process.exit(1);
    }

    console.log('\nSuccess!');
}
