import chalk from 'chalk';
import * as Commander from 'commander';
import * as Path from 'path';
import * as readline from 'readline';
import stripAnsi from 'strip-ansi';
import * as Util from 'util';
import { URI } from 'vscode-uri';
import * as app from './app';
import * as Link from './link';
import { mergeAsyncIterables } from './util/util';

jest.mock('readline');
const mockCreateInterface = jest.mocked(readline.createInterface);

const projectRoot = Path.join(__dirname, '..');
const projectRootUri = URI.file(projectRoot);

function argv(...args: string[]): string[] {
    return [...process.argv.slice(0, 2), ...args];
}

function getCommander() {
    return new Commander.Command();
}

function pathRoot(...parts: string[]): string {
    return Path.join(projectRoot, ...parts);
}

function pathSamples(...parts: string[]): string {
    return pathRoot('samples', ...parts);
}

// [message, args, resolve, error, log, info]
type ErrorCheck = undefined | jest.Constructable | string | RegExp;

interface TestCase {
    msg: string;
    testArgs: string[];
    errorCheck: ErrorCheck;
    eError: boolean;
    eLog: boolean;
    eInfo: boolean;
}

class RecordStdout {
    private static columnWidth = 80;
    private write = process.stdout.write.bind(process.stdout);
    private stdoutWrite: StdoutWrite | undefined;
    private columns: number = process.stdout.columns;
    readonly text: string[] = [];

    startCapture() {
        this.stopCapture();
        this.stdoutWrite = process.stdout.write;
        process.stdout.write = this.capture.bind(this);
        process.stdout.columns = RecordStdout.columnWidth;
    }

    stopCapture() {
        if (this.stdoutWrite) {
            process.stdout.write = this.stdoutWrite;
            process.stdout.columns = this.columns;
        }
        this.stdoutWrite = undefined;
    }

    private capture(buffer: Uint8Array | string, cb?: Callback): boolean;
    private capture(str: Uint8Array | string, encoding?: BufferEncoding, cb?: Callback): boolean;
    private capture(str: Uint8Array | string, encodingOrCb?: BufferEncoding | Callback, cb?: Callback): boolean {
        const encoding = typeof encodingOrCb === 'string' ? encodingOrCb : undefined;
        cb = cb || (typeof encodingOrCb === 'function' ? encodingOrCb : undefined);
        if (typeof str === 'string') {
            const t = this.text.pop() || '';
            const lines = str.split(/\r?\n/g);
            lines[0] = t + lines[0];
            this.text.push(...lines);
        }
        return encoding ? this.write(str, encoding, cb) : this.write(str, cb);
    }

    clear() {
        this.text.length = 0;
    }
}

const colorLevel = chalk.level;

describe('Validate cli', () => {
    const logger = makeLogger();
    const error = jest.spyOn(console, 'error').mockName('console.error').mockImplementation(logger.error);
    const log = jest.spyOn(console, 'log').mockName('console.log').mockImplementation(logger.log);
    const info = jest.spyOn(console, 'info').mockName('console.info').mockImplementation(logger.info);
    const listGlobalImports = jest.spyOn(Link, 'listGlobalImports').mockName('istGlobalImports');
    const addPathsToGlobalImports = jest.spyOn(Link, 'addPathsToGlobalImports').mockName('addPathsToGlobalImports');
    const removePathsFromGlobalImports = jest
        .spyOn(Link, 'removePathsFromGlobalImports')
        .mockName('removePathsFromGlobalImports');
    const capture = new RecordStdout();

    beforeEach(() => {
        log.mockClear();
        error.mockClear();
        mockCreateInterface.mockClear();
        logger.clear();
        capture.startCapture();
        chalk.level = 3;
    });

    afterEach(() => {
        info.mockClear();
        log.mockClear();
        error.mockClear();
        listGlobalImports.mockClear();
        addPathsToGlobalImports.mockClear();
        removePathsFromGlobalImports.mockClear();
        capture.stopCapture();
        capture.clear();
        chalk.level = colorLevel;
    });

    const failFastConfig = pathSamples('fail-fast/fail-fast-cspell.json');
    const failFastRoot = pathSamples('fail-fast');

    test.each`
        msg                                            | testArgs                                                                   | errorCheck         | eError   | eLog     | eInfo
        ${'with errors and excludes'}                  | ${['-r', 'samples', '*', '-e', 'Dutch.txt', '-c', 'samples/.cspell.json']} | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'no-args'}                                   | ${[]}                                                                      | ${'outputHelp'}    | ${false} | ${false} | ${false}
        ${'--help'}                                    | ${['--help']}                                                              | ${'outputHelp'}    | ${false} | ${false} | ${false}
        ${'current_file'}                              | ${[__filename]}                                                            | ${undefined}       | ${true}  | ${false} | ${false}
        ${'with spelling errors Dutch.txt'}            | ${[pathSamples('Dutch.txt')]}                                              | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'with spelling errors Dutch.txt words only'} | ${[pathSamples('Dutch.txt'), '--wordsOnly']}                               | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'with spelling errors Dutch.txt --legacy'}   | ${[pathSamples('Dutch.txt'), '--legacy']}                                  | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'with spelling errors --silent Dutch.txt'}   | ${['--silent', pathSamples('Dutch.txt')]}                                  | ${app.CheckFailed} | ${false} | ${false} | ${false}
        ${'current_file languageId'}                   | ${[__filename, '--languageId=typescript']}                                 | ${undefined}       | ${true}  | ${false} | ${false}
        ${'check help'}                                | ${['check', '--help']}                                                     | ${'outputHelp'}    | ${false} | ${false} | ${false}
        ${'check LICENSE'}                             | ${['check', pathRoot('LICENSE')]}                                          | ${undefined}       | ${false} | ${true}  | ${false}
        ${'check missing'}                             | ${['check', pathRoot('missing-file.txt')]}                                 | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'check with spelling errors'}                | ${['check', pathSamples('Dutch.txt')]}                                     | ${app.CheckFailed} | ${false} | ${true}  | ${false}
        ${'LICENSE'}                                   | ${[pathRoot('LICENSE')]}                                                   | ${undefined}       | ${true}  | ${false} | ${false}
        ${'samples/Dutch.txt'}                         | ${[pathSamples('Dutch.txt')]}                                              | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'with forbidden words'}                      | ${[pathSamples('src/sample-with-forbidden-words.md')]}                     | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'current_file --verbose'}                    | ${['--verbose', __filename]}                                               | ${undefined}       | ${true}  | ${false} | ${true}
        ${'bad config'}                                | ${['-c', __filename, __filename]}                                          | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'not found error by default'}                | ${['*.not']}                                                               | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'must find with error'}                      | ${['*.not', '--must-find-files']}                                          | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'must find force no error'}                  | ${['*.not', '--no-must-find-files']}                                       | ${undefined}       | ${true}  | ${false} | ${false}
        ${'cspell-bad.json'}                           | ${['-c', pathSamples('cspell-bad.json'), __filename]}                      | ${undefined}       | ${true}  | ${false} | ${false}
        ${'cspell-import-missing.json'}                | ${['-c', pathSamples('linked/cspell-import-missing.json'), __filename]}    | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'--fail-fast no option'}                     | ${['-r', failFastRoot, '*.txt']}                                           | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'--fail-fast with option'}                   | ${['-r', failFastRoot, '--fail-fast', '*.txt']}                            | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'--fail-fast with config'}                   | ${['-r', failFastRoot, '-c', failFastConfig, '*.txt']}                     | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'--no-fail-fast with config'}                | ${['-r', failFastRoot, '--no-fail-fast', '-c', failFastConfig, '*.txt']}   | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
    `('app $msg Expect Error: $errorCheck', async ({ testArgs, errorCheck, eError, eLog, eInfo }: TestCase) => {
        const commander = getCommander();
        const args = argv(...testArgs);
        const result = app.run(commander, args);
        if (!errorCheck) {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).resolves.toBeUndefined();
        } else {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).rejects.toThrowError(errorCheck);
        }
        // eslint-disable-next-line jest/no-conditional-expect
        eError ? expect(error).toHaveBeenCalled() : expect(error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-conditional-expect
        eLog ? expect(log).toHaveBeenCalled() : expect(log).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-conditional-expect
        eInfo ? expect(info).toHaveBeenCalled() : expect(info).not.toHaveBeenCalled();
        expect(capture.text).toMatchSnapshot();
        expect(logger.normalizedHistory()).toMatchSnapshot();
    });

    test.each`
        msg                                         | testArgs                                                        | errorCheck         | eError   | eLog     | eInfo
        ${'trace hello'}                            | ${['trace', 'hello']}                                           | ${undefined}       | ${false} | ${true}  | ${false}
        ${'trace hello'}                            | ${['trace', '--locale=en-gb', 'hello']}                         | ${undefined}       | ${false} | ${true}  | ${false}
        ${'trace help'}                             | ${['trace', '-h']}                                              | ${'outputHelp'}    | ${false} | ${false} | ${false}
        ${'trace not-in-any-dictionary'}            | ${['trace', 'not-in-any-dictionary']}                           | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'trace missing dictionary'}               | ${['trace', 'hello', '-c', 'samples/cspell-missing-dict.json']} | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'with spelling errors --debug Dutch.txt'} | ${['--debug', pathSamples('Dutch.txt')]}                        | ${app.CheckFailed} | ${true}  | ${true}  | ${true}
    `('app $msg Expect Error: $errorCheck', async ({ testArgs, errorCheck, eError, eLog, eInfo }: TestCase) => {
        const commander = getCommander();
        const args = argv(...testArgs);
        const result = app.run(commander, args);
        if (!errorCheck) {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).resolves.toBeUndefined();
        } else {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).rejects.toThrowError(errorCheck);
        }
        // eslint-disable-next-line jest/no-conditional-expect
        eError ? expect(error).toHaveBeenCalled() : expect(error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-conditional-expect
        eLog ? expect(log).toHaveBeenCalled() : expect(log).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-conditional-expect
        eInfo ? expect(info).toHaveBeenCalled() : expect(info).not.toHaveBeenCalled();
        expect(capture.text).toMatchSnapshot();
    });

    test.each`
        msg              | testArgs                                                 | errorCheck   | eError   | eLog    | eInfo
        ${'link'}        | ${['link']}                                              | ${undefined} | ${false} | ${true} | ${false}
        ${'link ls'}     | ${['link', 'ls']}                                        | ${undefined} | ${false} | ${true} | ${false}
        ${'link list'}   | ${['link', 'list']}                                      | ${undefined} | ${false} | ${true} | ${false}
        ${'link add'}    | ${['link', 'add', 'cspell-dict-cpp/cspell-ext.json']}    | ${undefined} | ${false} | ${true} | ${false}
        ${'link remove'} | ${['link', 'remove', 'cspell-dict-cpp/cspell-ext.json']} | ${undefined} | ${false} | ${true} | ${false}
    `('app $msg', async ({ testArgs, errorCheck, eError, eLog, eInfo }: TestCase) => {
        listGlobalImports.mockImplementation(_listGlobalImports());
        addPathsToGlobalImports.mockImplementation(_addPathsToGlobalImports());
        removePathsFromGlobalImports.mockImplementation(_removePathsFromGlobalImports());
        const commander = getCommander();
        const args = argv(...testArgs);
        const result = app.run(commander, args);
        if (!errorCheck) {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).resolves.toBeUndefined();
        } else {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).rejects.toThrowError(errorCheck);
        }
        // eslint-disable-next-line jest/no-conditional-expect
        eError ? expect(error).toHaveBeenCalled() : expect(error).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-conditional-expect
        eLog ? expect(log).toHaveBeenCalled() : expect(log).not.toHaveBeenCalled();
        // eslint-disable-next-line jest/no-conditional-expect
        eInfo ? expect(info).toHaveBeenCalled() : expect(info).not.toHaveBeenCalled();
        expect(capture.text).toMatchSnapshot();
    });

    test.each`
        testArgs                                                                                       | stdin         | errorCheck
        ${['sug']}                                                                                     | ${undefined}  | ${'outputHelp'}
        ${['sug', 'mexico', '-d=en-us']}                                                               | ${undefined}  | ${undefined}
        ${['sug', 'mexico', '-d=en_us']}                                                               | ${undefined}  | ${undefined}
        ${['sug', 'mexico', '-d=en-gb']}                                                               | ${undefined}  | ${undefined}
        ${['sug', 'mexico', '-d=en_us', '-v']}                                                         | ${undefined}  | ${undefined}
        ${['sug', '--stdin', '-d=en_us', '-v']}                                                        | ${['mexico']} | ${undefined}
        ${['sug', 'mexico', '-d=en_us', '-v', '--num-suggestions=0']}                                  | ${undefined}  | ${undefined}
        ${['sug', 'dutch', '-d=en_us', '-d=en-gb', '-v', '--num-suggestions=2']}                       | ${undefined}  | ${undefined}
        ${['sug', 'dutch', '--dictionaries=en_us', '--dictionary=en-gb', '-v', '--num-suggestions=2']} | ${undefined}  | ${undefined}
        ${['sug', 'dutch', '--dictionaries=en_us', '-v', '--num-suggestions=2']}                       | ${undefined}  | ${undefined}
        ${['sug', 'dutch', '--dictionaries=en_us', '-v', '--num-suggestions=2']}                       | ${undefined}  | ${undefined}
    `('app suggest $testArgs', async ({ testArgs, errorCheck, stdin }) => {
        chalk.level = 0;
        const values = stdin || [];
        mockCreateInterface.mockReturnValue({
            [Symbol.asyncIterator]: () => mergeAsyncIterables(values),
        } as ReturnType<typeof readline.createInterface>);
        listGlobalImports.mockImplementation(_listGlobalImports());
        addPathsToGlobalImports.mockImplementation(_addPathsToGlobalImports());
        removePathsFromGlobalImports.mockImplementation(_removePathsFromGlobalImports());
        const commander = getCommander();
        const args = argv(...testArgs);
        const result = app.run(commander, args);
        if (!errorCheck) {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).resolves.toBeUndefined();
        } else {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(result).rejects.toThrowError(errorCheck);
        }
        expect(capture.text).toMatchSnapshot();
        expect(log.mock.calls.join('\n')).toMatchSnapshot();
        expect(error.mock.calls.join('\n')).toMatchSnapshot();
        expect(mockCreateInterface).toHaveBeenCalledTimes(stdin ? 1 : 0);
    });
});

function _listGlobalImports(): typeof Link['listGlobalImports'] {
    return () => {
        return {
            list: [],
            globalSettings: {},
        };
    };
}

function _addPathsToGlobalImports(): typeof Link['addPathsToGlobalImports'] {
    return (_paths: string[]) => {
        return {
            success: true,
            resolvedSettings: [],
            error: undefined,
        };
    };
}

function _removePathsFromGlobalImports(): typeof Link['removePathsFromGlobalImports'] {
    return (paths: string[]) => {
        return {
            success: true,
            error: undefined,
            removed: paths,
        };
    };
}

type StdoutWrite = typeof process.stdout.write;
type Callback = (err?: Error) => void;

function makeLogger() {
    const history: string[] = [];

    function record(prefix: string, ...rest: unknown[]) {
        const s = Util.format(...rest);
        s.split('\n').forEach((line) => history.push(prefix + '\t' + line));
    }

    function normalizedHistory() {
        let t = history.join('\n');
        t = stripAnsi(t);
        t = t.replace(RegExp(escapeRegExp(projectRootUri.toString()), 'gi'), '.');
        t = t.replace(RegExp(escapeRegExp(projectRoot), 'gi'), '.');
        t = t.replace(/\\/g, '/');
        t = t.replace(/(?<=^info\s+Date:).*$/gm, ' Sat, 03 Apr 2021 11:25:33 GMT');
        t = t.replace(/\b[\d.]+ms\b/g, '0.00ms');
        t = t.replace(/\b[\d.]+S\b/g, '0.00S');
        return t;
    }

    return {
        clear: () => {
            history.length = 0;
            return;
        },
        log: (...params: unknown[]) => record('log', ...params),
        error: (...params: unknown[]) => record('error', ...params),
        info: (...params: unknown[]) => record('info', ...params),
        history,
        normalizedHistory,
    };
}

function escapeRegExp(s: string): string {
    return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}
