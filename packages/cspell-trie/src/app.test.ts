import * as Path from 'node:path';

import * as Commander from 'commander';
import type { Constructable } from 'vitest';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as app from './app.js';

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

type ErrorResult = undefined | Constructable | string | RegExp;
type Test = [string, string[], ErrorResult];
const tests: Test[] = [
    t('No Args', [], Commander.CommanderError),
    t('create file', ['create', pathSamples('softwareTerms.txt'), '-o', pathTemp('samples.trie')], undefined),
    t('read file', ['reader', pathTemp('samples.trie'), '-o', pathTemp('test.txt')], undefined),
];

describe('Validate App', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    test.each(tests)('%s', async (_: string, args: string[], errorResult: ErrorResult) => {
        process.stdout.columns = 80;
        process.stderr.columns = 80;
        const out = createCollector();

        const commander = getCommander();
        commander.configureOutput({ writeOut: out.stdout, writeErr: out.stderr });
        commander.exitOverride();

        vi.spyOn(console, 'error').mockImplementation(out.error);
        vi.spyOn(console, 'log').mockImplementation(out.log);
        vi.spyOn(console, 'info').mockImplementation(out.info);
        vi.spyOn(console, 'warn').mockImplementation(out.warn);

        const result = app.run(commander, argv(...args));
        await (errorResult ? expect(result).rejects.toThrow(errorResult) : expect(result).resolves.not.toThrow());
        expect(out.getText()).toMatchSnapshot();
    });
});

function t(testName: string, args: string[], errorResult: ErrorResult): Test {
    return [testName, args, errorResult];
}

interface Collector {
    log(text: string): void;
    info(text: string): void;
    warn(text: string): void;
    error(text: string): void;
    stdout(text: string): void;
    stderr(text: string): void;
    lines: string[];
    getText(): string;
}

function createCollector(): Collector {
    const lines: string[] = [];

    function handler(prefix: string): (text: string) => void {
        return function (text: string) {
            lines.push(prefix + text.split('\n').join('\n' + prefix));
        };
    }
    function getText(): string {
        return lines.join('\n');
    }
    const log = handler('[log]: ');
    const info = handler('[info]: ');
    const warn = handler('[warn]: ');
    const error = handler('[error]: ');
    const stdout = handler('[stdout]: ');
    const stderr = handler('[stderr]: ');

    return { lines, getText, log, info, warn, error, stdout, stderr };
}
