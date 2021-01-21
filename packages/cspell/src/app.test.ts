import * as app from './app';
import * as Commander from 'commander';
import * as Path from 'path';

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
    let current = '';

    test.each`
        msg                                | testArgs                                                                | errorCheck         | eError   | eLog     | eInfo
        ${'no-args'}                       | ${[]}                                                                   | ${'outputHelp'}    | ${false} | ${false} | ${false}
        ${'current_file'}                  | ${[__filename]}                                                         | ${undefined}       | ${true}  | ${false} | ${false}
        ${'with spelling errors'}          | ${[pathSamples('Dutch.txt')]}                                           | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'current_file languageId'}       | ${[__filename, '--languageId=typescript']}                              | ${undefined}       | ${true}  | ${false} | ${false}
        ${'trace hello'}                   | ${['trace', 'hello']}                                                   | ${undefined}       | ${false} | ${true}  | ${false}
        ${'trace not-in-any-dictionary'}   | ${['trace', 'not-in-any-dictionary']}                                   | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'check LICENSE'}                 | ${['check', pathRoot('LICENSE')]}                                       | ${undefined}       | ${false} | ${true}  | ${false}
        ${'check missing'}                 | ${['check', pathRoot('missing-file.txt')]}                              | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'LICENSE'}                       | ${[pathRoot('LICENSE')]}                                                | ${undefined}       | ${true}  | ${false} | ${false}
        ${'samples/Dutch.txt'}             | ${[pathSamples('Dutch.txt')]}                                           | ${app.CheckFailed} | ${true}  | ${true}  | ${false}
        ${'current_file --verbose'}        | ${['--verbose', __filename]}                                            | ${undefined}       | ${true}  | ${false} | ${true}
        ${'bad config'}                    | ${['-c', __filename, __filename]}                                       | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'not found no error by default'} | ${['*.not']}                                                            | ${undefined}       | ${true}  | ${false} | ${false}
        ${'must find with error'}          | ${['*.not', '--must-find-files']}                                       | ${app.CheckFailed} | ${true}  | ${false} | ${false}
        ${'must find force no error'}      | ${['*.not', '--no-must-find-files']}                                    | ${undefined}       | ${true}  | ${false} | ${false}
        ${'cspell-bad.json'}               | ${['-c', pathSamples('cspell-bad.json'), __filename]}                   | ${undefined}       | ${true}  | ${false} | ${false}
        ${'cspell-import-missing.json'}    | ${['-c', pathSamples('linked/cspell-import-missing.json'), __filename]} | ${app.CheckFailed} | ${true}  | ${false} | ${false}
    `('app $msg $testArgs', async ({ msg, testArgs, errorCheck, eError, eLog, eInfo }: TestCase) => {
        expect(current).toBe('');
        current = msg;
        const commander = getCommander();
        const error = jest.spyOn(console, 'error').mockName('console.error').mockImplementation();
        const log = jest.spyOn(console, 'log').mockName('console.log').mockImplementation();
        const info = jest.spyOn(console, 'info').mockName('console.info').mockImplementation();
        const args = argv(...testArgs);
        try {
            const result = app.run(commander, args);
            if (!errorCheck) {
                await expect(result).resolves.toBeUndefined();
            } else {
                await expect(result).rejects.toThrowError(errorCheck);
            }
            eError ? expect(error).toHaveBeenCalled() : expect(error).not.toHaveBeenCalled();
            eLog ? expect(log).toHaveBeenCalled() : expect(log).not.toHaveBeenCalled();
            eInfo ? expect(info).toHaveBeenCalled() : expect(info).not.toHaveBeenCalled();
            expect(current).toBe(msg);
        } finally {
            info.mockRestore();
            log.mockRestore();
            error.mockRestore();
            current = '';
        }
    });
});
