import * as Shell from 'shelljs';
import * as Path from 'path';
import { readConfig } from './config';
import { Repository } from './configDef';
import { execAsync } from './sh';
import { repositoryDir, updateRepositoryAsync } from './repositoryHelper';
import { checkAgainstSnapshot } from './snapshots';
import { shouldCheckRepo } from './shouldCheckRepo';
import Chalk from 'chalk';
import { formatExecOutput, logWithPrefix } from './outputHelper';

const config = readConfig();
const cspellArgs = '-u';
const jsCspell = JSON.stringify(Path.resolve(__dirname, '..', '..', 'bin.js'));

const cspellCommand = `node ${jsCspell} ${cspellArgs}`;

let checkCount = 0;

const colors = [Chalk.green, Chalk.blue, Chalk.yellow, Chalk.cyan, Chalk.magenta, Chalk.rgb(255, 192, 64)];

interface Result {
    stdout: string;
    stderr: string;
    code: number;
    elapsedTime: number;
}

async function execCheck(rep: Repository, update: boolean): Promise<CheckResult> {
    const name = rep.path;
    const path = Path.join(repositoryDir, rep.path);
    const color = colors[checkCount % colors.length];
    const prefix = color(name + '\t ');
    ++checkCount;

    logWithPrefix(prefix, '');
    logWithPrefix(prefix, color`**********************************************`);
    logWithPrefix(prefix, color`*  Checking: `);
    logWithPrefix(prefix, color`*    '${name}'`);
    logWithPrefix(prefix, color`**********************************************\n`);
    if (!(await updateRepositoryAsync(prefix, rep.path))) {
        logWithPrefix(prefix, '******** fail ********');
        return Promise.resolve({ success: false, rep, elapsedTime: 0 });
    }
    printTime(prefix);
    const cspellResult = await execCommand(prefix, path, cspellCommand, rep.args);
    logResult(prefix, cspellResult);
    const r = checkResult(rep, cspellResult, update);
    printTime(prefix);
    if (r.diff) {
        logWithPrefix(prefix, r.diff);
        logWithPrefix(prefix, '');
    }
    logWithPrefix(prefix, color`\n************ Done: ${name} ************\n`);
    return { success: r.match, rep, elapsedTime: cspellResult.elapsedTime };
}

function printTime(prefix: string) {
    const time = new Date().toISOString();
    logWithPrefix(prefix, time);
}

async function execCommand(prefix: string, path: string, command: string, args: string[]): Promise<Result> {
    const start = Date.now();
    const argv = args.map((a) => JSON.stringify(a)).join(' ');
    const fullCommand = command + ' ' + argv;
    Shell.pushd('-q', path);
    logWithPrefix(prefix, `Execute: '${fullCommand}'`);
    const pResult = execAsync(fullCommand);
    Shell.popd('-q', '+0');
    const result = await pResult;
    const { stdout, stderr, code } = result;
    return cleanResult({
        stdout,
        stderr,
        code,
        elapsedTime: Date.now() - start,
    });
}

function logResult(prefix: string, result: Result) {
    const fullOutputLines = formatExecOutput(result).split('\n');
    const output = (fullOutputLines.length > 7 ? '...\n' : '') + fullOutputLines.slice(-7).join('\n');
    logWithPrefix(prefix, output);
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

function rightJustify(s: string, w: number) {
    return (' '.repeat(w) + s).slice(-w);
}

function report(reposChecked: Repository[], results: CheckResult[]) {
    const sorted = [...reposChecked];
    sorted.sort((a, b) => a.path.localeCompare(b.path));
    const resultsByRep = new Map(results.map((r) => [r.rep, r]));
    const w = Math.max(...reposChecked.map((r) => r.path.length));
    const r = sorted.map((r) => {
        const { success = undefined, elapsedTime = 0 } = resultsByRep.get(r) || {};
        const mark = success === undefined ? '🛑' : success === false ? '❌' : '✅';
        const time = Chalk.gray(rightJustify(elapsedTime ? `${(elapsedTime / 1000).toFixed(3)}s` : '', 9));
        const padding = ' '.repeat(w - r.path.length);
        return `\t ${mark}  ${r.path} ${padding} ${time}`;
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
    /** Max number of parallel processes */
    parallelLimit: number;
}

type PendingState = 'pending' | 'rejected' | 'resolved';

interface PendingPromise<T> {
    state: PendingState;
    promise: Promise<T>;
}

function asPendingPromise<T>(promise: Promise<T>): PendingPromise<T> {
    const pp: PendingPromise<T> = {
        promise,
        state: 'pending',
    };

    promise.then(
        (v) => ((pp.state = 'resolved'), v),
        (r) => ((pp.state = 'rejected'), r)
    );

    return pp;
}

/**
 * Parallel Process some values using the mapFn while limiting the number
 * running in parallel.
 * @param values values to map
 * @param mapFn a mapping function that returns a promise
 * @param limit the max number of pending promises.
 */
async function* asyncBuffer<T, U>(
    values: Iterable<T> | AsyncIterable<T>,
    mapFn: (v: T, i: number) => Promise<U>,
    limit: number
): AsyncIterable<U> {
    let pending: PendingPromise<U>[] = [];
    let index = 0;
    for await (const v of values) {
        const p = mapFn(v, index);
        pending.push(asPendingPromise(p));
        if (limit > 0 && pending.length >= limit) {
            await Promise.race(pending.map((pp) => pp.promise));
            const stillPending: PendingPromise<U>[] = [];
            for (const p of pending) {
                if (p.state === 'pending') {
                    stillPending.push(p);
                } else {
                    yield p.promise;
                }
            }
            pending = stillPending;
        }
        index++;
    }
    yield* pending.map((p) => p.promise);
    return;
}

interface CheckResult {
    success: boolean;
    elapsedTime: number;
    rep: Repository;
}

function tf(v: boolean | undefined): 'true' | 'false' {
    return v ? 'true' : 'false';
}

export async function check(patterns: string[], options: CheckOptions): Promise<void> {
    const { exclude, update, fail, parallelLimit } = options;
    const matching = config.repositories.filter((rep) => shouldCheckRepo(rep, { patterns, exclude }));

    console.log(`
Check
Patterns:       [${patterns.join(', ') || '*'}]
Exclude:        [${exclude.join(', ')}]
Update:         ${tf(update)}
Parallel:       ${parallelLimit}
Stop on fail:   ${tf(fail)}

`);

    const results: CheckResult[] = [];

    const buffered = asyncBuffer(matching, async (rep) => execCheck(rep, update), parallelLimit);

    for await (const r of buffered) {
        results.push(r);
        if (fail && !r.success) {
            break;
        }
    }

    const failed: Repository[] = results.filter((r) => !r.success).map((r) => r.rep);

    const success = results.length === matching.length && !failed.length;
    console.log();
    console.log(
        failed.length ? 'Some checks failed:' : !matching.length ? 'No Repositories Found' : 'All checks passed:'
    );
    console.log(report(matching, results));

    if (!success) {
        process.exitCode = 1;
    } else {
        console.log('\nSuccess!');
    }
}
