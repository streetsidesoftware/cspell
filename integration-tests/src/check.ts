import * as Shell from 'shelljs';
import * as Path from 'path';
import { readConfig } from './config';
import { Repository } from './configDef';
import { exec } from './sh';
import { repositoryDir, updateRepository } from './repositoryHelper';
import { checkAgainstSnapshot } from './snapshots';
import { shouldCheckRepo } from './shouldCheckRepo';

const config = readConfig();
const cspellArgs = '-u';
const jsCspell = JSON.stringify(Path.resolve(__dirname, '..', '..', 'bin.js'));

const cspellCommand = `node ${jsCspell} ${cspellArgs}`;

interface Result {
    stdout: string;
    stderr: string;
    code: number;
    elapsedTime: number;
}

function execCheck(rep: Repository, update: boolean): boolean {
    const name = rep.path;
    const path = Path.join(repositoryDir, rep.path);
    console.log(`
Checking '${name}'...
`);
    updateRepository(rep.path);
    printTime();
    const cspellResult = execCommand(path, cspellCommand, rep.args);
    logResult(cspellResult);
    const r = checkResult(rep, cspellResult, update);
    printTime();
    if (r.diff) {
        console.log();
        console.log(r.diff);
    }
    return r.match;
}

function printTime() {
    console.log(new Date().toISOString());
}

function execCommand(path: string, command: string, args: string[]): Result {
    const start = Date.now();
    const argv = args.map((a) => JSON.stringify(a)).join(' ');
    const fullCommand = command + ' ' + argv;
    Shell.pushd('-q', path);
    console.log(`Execute: '${fullCommand}'`);
    const result = exec(fullCommand);
    Shell.popd('-q', '+0');
    const { stdout, stderr, code } = result;
    return cleanResult({
        stdout,
        stderr,
        code,
        elapsedTime: Date.now() - start,
    });
}

function logResult(result: Result) {
    const { elapsedTime } = result;
    const fullOutputLines = assembleOutput(result).split('\n');
    const output =
        (fullOutputLines.length > 5 ? '...\n' : '') +
        fullOutputLines.slice(-5).join('\n');
    console.log(`${output} \n time: ${(elapsedTime / 1000).toFixed(3)}s`);
}

function assembleOutput(result: Result) {
    const { stdout, stderr, code } = result;
    return `${stdout} ${stderr} exit code: ${code}`;
}

function checkResult(rep: Repository, result: Result, update: boolean) {
    return checkAgainstSnapshot(rep, assembleOutput(result), update);
}

function cleanResult(result: Result): Result {
    const { stderr, stdout, ...rest } = result;
    return {
        ...rest,
        stderr: cleanOutput(stderr),
        stdout: cleanOutput(stdout),
    };
}

function cleanOutput(out: string): string {
    const parent = Path.resolve(Path.join(__dirname, '..', '..'));
    return out
        .split('\n')
        .map((line) => line.replace(repositoryDir, '.'))
        .map((line) => line.replace(parent, '.'))
        .join('\n');
}

function compare(a: Result, b: Result): boolean {
    return a.code === b.code && a.stderr === b.stderr && a.stdout === b.stdout;
}

function report(reposChecked: Repository[], failed: Repository[]) {
    const setFailed = new Set(failed);
    const r = reposChecked.map((r) => {
        const mark = setFailed.has(r) ? '❌' : '✅';
        return `\t ${mark} ${r.path}`;
    });
    return r.join('\n');
}

export interface CheckOptions {
    /** Exclusion patterns */
    exclude: string[];
    /** Update snapshot */
    update: boolean;
    /** Stop on first error */
    fail: boolean;
}

export function check(patterns: string[], options: CheckOptions): void {
    const { exclude, update, fail } = options;
    const matching = config.repositories.filter((rep) =>
        shouldCheckRepo(rep, { patterns, exclude })
    );

    const failed: Repository[] = [];
    for (const rep of matching) {
        const r = execCheck(rep, update);
        if (!r) {
            failed.push(rep);
            if (fail) {
                break;
            }
        }
    }

    console.log(failed.length ? 'Some checks failed:' : 'All checks passed:');
    console.log(report(matching, failed));

    if (failed.length) {
        process.exit(1);
    }
    console.log('\nSuccess!');
}
