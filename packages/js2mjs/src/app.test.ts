import { describe, expect, test, afterEach, vi } from 'vitest';
import { Command, CommanderError } from 'commander';
import { run, app } from './app.js';

// const oc = (a: object) => expect.objectContaining(a);
const sc = (s: string) => expect.stringContaining(s);
const ac = <T extends any>(a: T[]) => expect.arrayContaining(a);

describe('app', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test.each`
        args                                                   | expected
        ${'*.md'}                                              | ${ac([sc('README.md'), sc('done.')])}
        ${['not_found', '--no-must-find-files', '--no-color']} | ${ac(['Find Files:', 'done.'])}
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
        const spyLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        await expect(run(argv, program)).rejects.toBeInstanceOf(CommanderError);
    });

    test.each`
        args                      | expected
        ${'*.md'}                 | ${ac([sc('README.md')])}
        ${['*.md', '--no-color']} | ${ac([sc(' - README.md')])}
    `('app $args', async ({ args, expected }) => {
        const argv = genArgv(args);
        const program = new Command();
        program.exitOverride((e) => {
            throw e;
        });
        const spyLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        const cmd = await app(program);
        expect(cmd).toBe(program);
        await expect(cmd.parseAsync(argv)).resolves.toBe(program);
        expect(spyLog.mock.calls.map(([a]) => a)).toEqual(expected);
    });
});

function genArgv(args: string | string[]): string[] {
    args = typeof args === 'string' ? [args] : args;
    const argv: string[] = [process.argv[0], 'bin.mjs', ...args];
    return argv;
}
