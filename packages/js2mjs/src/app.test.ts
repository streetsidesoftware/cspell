import { describe, expect, test, afterEach, vi } from 'vitest';
import { Command, CommanderError } from 'commander';
import { run, app } from './app.js';

// const oc = (a: object) => expect.objectContaining(a);
const sc = (s: string) => expect.stringContaining(s);
const sm = (s: string | RegExp) => expect.stringMatching(s);
const ac = <T extends any>(a: T[]) => expect.arrayContaining(a);

describe('app', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test.each`
        args                                                   | expected
        ${['.', '--root=dist', '--output=temp']}               | ${ac([sm(/app.js\b.*\bapp.mjs/), sc('done.')])}
        ${['not_found', '--no-must-find-files', '--no-color']} | ${ac(['done.'])}
    `('run $args', async ({ args, expected }) => {
        const argv = genArgv(args);
        const program = new Command();
        program.exitOverride((e) => {
            throw e;
        });
        const spyLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        await expect(run(argv, program)).resolves.toBeUndefined();
        expect(spyLog.mock.calls.map(([a]) => a)).toEqual(expected);
    });

    test.each`
        args
        ${'--help'}
    `('run error $args', async ({ args }) => {
        const argv = genArgv(args);
        const program = new Command();
        program.exitOverride((e) => {
            throw e;
        });
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
        await expect(run(argv, program)).rejects.toBeInstanceOf(CommanderError);
    });
});

function genArgv(args: string | string[]): string[] {
    args = typeof args === 'string' ? [args] : args;
    const argv: string[] = [process.argv[0], 'bin.mjs', ...args, '--verbose', '--dry-run'];
    return argv;
}
