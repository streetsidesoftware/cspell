import * as app from './app';
import * as Commander from 'commander';
import * as Path from 'path';
import * as Link from './link';
// import { listGlobalImports /* addPathsToGlobalImports, removePathsFromGlobalImports */ } from './link';

const projectRoot = Path.join(__dirname, '..');

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

describe('Validate cli', () => {
    const error = jest.spyOn(console, 'error').mockName('console.error').mockImplementation();
    const log = jest.spyOn(console, 'log').mockName('console.log').mockImplementation();
    const info = jest.spyOn(console, 'info').mockName('console.info').mockImplementation();
    const listGlobalImports = jest.spyOn(Link, 'listGlobalImports').mockName('istGlobalImports');
    const addPathsToGlobalImports = jest.spyOn(Link, 'addPathsToGlobalImports').mockName('addPathsToGlobalImports');
    const removePathsFromGlobalImports = jest
        .spyOn(Link, 'removePathsFromGlobalImports')
        .mockName('removePathsFromGlobalImports');

    afterEach(() => {
        info.mockClear();
        log.mockClear();
        error.mockClear();
        listGlobalImports.mockClear();
        addPathsToGlobalImports.mockClear();
        removePathsFromGlobalImports.mockClear();
    });

    test.each`
        msg                              | testArgs                                                                | errorCheck         | eError   | eLog     | eInfo
        ${'no-args'}                     | ${[]}                                                                   | ${'outputHelp'}    | ${true}  | ${true}  | ${false}
        ${'current_file'}                | ${[__filename]}                                                         | ${undefined}       | ${true}  | ${false} | ${false}
        ${'with spelling errors'}        | ${[pathSamples('Dutch.txt')]}                                           | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'current_file languageId'}     | ${[__filename, '--languageId=typescript']}                              | ${undefined}       | ${true}  | ${false} | ${false}
        ${'trace hello'}                 | ${['trace', 'hello']}                                                   | ${undefined}       | ${false} | ${true}  | ${false}
        ${'trace not-in-any-dictionary'} | ${['trace', 'not-in-any-dictionary']}                                   | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'check LICENSE'}               | ${['check', pathRoot('LICENSE')]}                                       | ${undefined}       | ${false} | ${true}  | ${false}
        ${'check missing'}               | ${['check', pathRoot('missing-file.txt')]}                              | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'LICENSE'}                     | ${[pathRoot('LICENSE')]}                                                | ${undefined}       | ${true}  | ${false} | ${false}
        ${'samples/Dutch.txt'}           | ${[pathSamples('Dutch.txt')]}                                           | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'current_file --verbose'}      | ${['--verbose', __filename]}                                            | ${undefined}       | ${true}  | ${false} | ${true}
        ${'bad config'}                  | ${['-c', __filename, __filename]}                                       | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'not found error by default'}  | ${['*.not']}                                                            | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'must find with error'}        | ${['*.not', '--must-find-files']}                                       | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'must find force no error'}    | ${['*.not', '--no-must-find-files']}                                    | ${undefined}       | ${true}  | ${false} | ${false}
        ${'cspell-bad.json'}             | ${['-c', pathSamples('cspell-bad.json'), __filename]}                   | ${undefined}       | ${true}  | ${false} | ${false}
        ${'cspell-import-missing.json'}  | ${['-c', pathSamples('linked/cspell-import-missing.json'), __filename]} | ${app.CheckFailed} | ${true}  | ${false} | ${false}
    `('app $msg $testArgs', executeTest);

    async function executeTest({ testArgs, errorCheck, eError, eLog, eInfo }: TestCase) {
        const commander = getCommander();
        const args = argv(...testArgs);
        const result = app.run(commander, args);
        if (!errorCheck) {
            await expect(result).resolves.toBeUndefined();
        } else {
            await expect(result).rejects.toThrowError(errorCheck);
        }
        eError ? expect(error).toHaveBeenCalled() : expect(error).not.toHaveBeenCalled();
        eLog ? expect(log).toHaveBeenCalled() : expect(log).not.toHaveBeenCalled();
        eInfo ? expect(info).toHaveBeenCalled() : expect(info).not.toHaveBeenCalled();
    }

    test.each`
        msg       | testArgs                                                 | errorCheck   | eError   | eLog    | eInfo
        ${'link'} | ${['link']}                                              | ${undefined} | ${false} | ${true} | ${false}
        ${'link'} | ${['link', 'ls']}                                        | ${undefined} | ${false} | ${true} | ${false}
        ${'link'} | ${['link', 'list']}                                      | ${undefined} | ${false} | ${true} | ${false}
        ${'link'} | ${['link', 'add', 'cspell-dict-cpp/cspell-ext.json']}    | ${undefined} | ${false} | ${true} | ${false}
        ${'link'} | ${['link', 'remove', 'cspell-dict-cpp/cspell-ext.json']} | ${undefined} | ${false} | ${true} | ${false}
    `('app $msg $testArgs', executeLinkTest);

    async function executeLinkTest({ testArgs, errorCheck, eError, eLog, eInfo }: TestCase) {
        listGlobalImports.mockImplementation(_listGlobalImports());
        addPathsToGlobalImports.mockImplementation(_addPathsToGlobalImports());
        removePathsFromGlobalImports.mockImplementation(_removePathsFromGlobalImports());
        const commander = getCommander();
        const args = argv(...testArgs);
        const result = app.run(commander, args);
        if (!errorCheck) {
            await expect(result).resolves.toBeUndefined();
        } else {
            await expect(result).rejects.toThrowError(errorCheck);
        }
        eError ? expect(error).toHaveBeenCalled() : expect(error).not.toHaveBeenCalled();
        eLog ? expect(log).toHaveBeenCalled() : expect(log).not.toHaveBeenCalled();
        eInfo ? expect(info).toHaveBeenCalled() : expect(info).not.toHaveBeenCalled();
    }
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
