import * as Shell from 'shelljs';
import * as Path from 'path';
import { readConfig } from './config';
import { Repository } from './configDef';
import { exec } from './sh';
import { repositoryDir } from './repositoryHelper';

const config = readConfig();
const cspell = require.resolve('cspell/bin.js');
const cspellArgs = '-u'
const jsCspell = JSON.stringify(cspell);
const jsCurrent = JSON.stringify(Path.resolve(__dirname, '..', '..', 'bin.js'));

const cspellCommand = `node ${jsCspell} ${cspellArgs}`;
const cspellCurrent = `node ${jsCurrent} ${cspellArgs}`;

interface Result {
    stdout: string;
    stderr: string;
    code: number;
    elapsedTime: number;
}

function execCheck(rep: Repository) {
    const name = rep.path;
    const path = Path.join(repositoryDir, rep.path);
    console.log(`
Checking '${name}'...
`);
    printTime();
    const cspellResult = execCommand(path, cspellCommand, rep.args);
    logResult(cspellResult);
    printTime();
    const newResult = execCommand(path, cspellCurrent, rep.args);
    logResult(newResult);
    printTime();
    return compare(cspellResult, newResult);
}

function printTime() {
    console.log((new Date()).toISOString());
}

function execCommand(dir: string, command: string, args: string[]): Result {
    const start = Date.now();
    const argv = args.map(a => JSON.stringify(a)).join(' ');
    const fullCommand = command + ' ' + argv;
    Shell.pushd('-q', dir);
    console.log(`Execute: '${fullCommand}'`)
    const result = exec(fullCommand);
    Shell.popd('-q', '+0');
    const { stdout, stderr, code } = result;
    return { stdout, stderr, code, elapsedTime: Date.now() - start};
}

function logResult(result: Result) {
    const { stdout, stderr, code, elapsedTime } = result;
    console.log(`${stdout} ${stderr} exit code: ${code} \n time: ${(elapsedTime / 1000).toFixed(3)}s`)
}

function compare(a: Result, b: Result): boolean {
    return a.code === b.code
    && a.stderr === b.stderr
    && a.stdout === b.stdout
}

export function check(match: string) {
    exec('git submodule update --init --recursive --depth 1', { echo: true, bail: true });
    const failed = config.repositories
        .filter(rep => rep.path.includes(match))
        .filter(rep => !execCheck(rep));
    if (failed.length) {
        const failedChecks = failed
            .map(rep => rep.path)
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
