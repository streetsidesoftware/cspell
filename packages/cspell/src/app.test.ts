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
type Test = [string, string[], ErrorCheck, boolean, boolean, boolean];

const tests: Test[] = [
    t('test app no-args', [], 'outputHelp', true, true, false),
    t('test app current_file', [__filename], undefined, true, false, false),
    t('test app trace hello', ['trace', 'hello'], undefined, false, true, false),
    t('test app check LICENSE', ['check', pathRoot('LICENSE')], undefined, false, true, false),
    t('test app LICENSE', [pathRoot('LICENSE')], undefined, true, false, false),
    t('test app samples/Dutch.txt', [pathSamples('Dutch.txt')], app.CheckFailed, true, true, false),
    t('test app current_file --verbose', ['--verbose', __filename], undefined, true, false, true),
    t('test app bad config', ['-c', __filename, __filename], undefined, true, true, false),
];

describe('Validate cli', () => {
    let current = '';

    test.each(tests)(
        '%s',
        async (msg, testArgs: string[], errorCheck: ErrorCheck, eError: boolean, eLog: boolean, eInfo: boolean) => {
            expect(current).toBe('');
            current = msg;
            const commander = getCommander();
            const error = jest.spyOn(console, 'error').mockImplementation();
            const log = jest.spyOn(console, 'log').mockImplementation();
            const info = jest.spyOn(console, 'info').mockImplementation();
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
        }
    );
});

function t(
    msg: string,
    args: string[],
    errorCheck: ErrorCheck,
    emitError: boolean,
    emitLog: boolean,
    emitInfo: boolean
): Test {
    return [msg, args, errorCheck, emitError, emitLog, emitInfo];
}
