import * as Path from 'path';
import * as Commander from 'commander';

import * as app from './app';

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

function pathTemp(...parts: string[]): string {
    return pathRoot('temp', ...parts);
}

type ErrorResult = undefined | jest.Constructable | string | RegExp;
type Test = [string, string[], ErrorResult];
const tests: Test[] = [
    t('No Args', [], Commander.CommanderError),
    t('create file', ['create', pathSamples('softwareTerms.txt'), '-o', pathTemp('samples.trie')], undefined),
    t('read file', ['reader', pathTemp('samples.trie'), '-o', pathTemp('test.txt')], undefined),
];

describe('Validate App', () => {
    test.each(tests)('%s', async (_: string, args: string[], errorResult: ErrorResult) => {
        const commander = getCommander();
        commander.exitOverride();

        const error = jest.spyOn(console, 'error').mockImplementation();
        const log = jest.spyOn(console, 'log').mockImplementation();
        const info = jest.spyOn(console, 'info').mockImplementation();

        try {
            const result = app.run(commander, argv(...args));
            if (errorResult) {
                // eslint-disable-next-line jest/no-conditional-expect
                await expect(result).rejects.toThrow(errorResult);
            } else {
                // eslint-disable-next-line jest/no-conditional-expect
                await expect(result).resolves.not.toThrow();
            }
        } finally {
            error.mockRestore();
            log.mockRestore();
            info.mockRestore();
        }
    });
});

function t(testName: string, args: string[], errorResult: ErrorResult): Test {
    return [testName, args, errorResult];
}
