import type { SpyInstance } from 'vitest';
import { describe, expect, test, afterEach, vi, beforeEach } from 'vitest';

import * as app from './app';
import * as path from 'path';

describe('app', () => {
    let log: SpyInstance<Parameters<typeof console.log>>;
    let error: SpyInstance<Parameters<typeof console.error>>;

    beforeEach(() => {
        log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test.each`
        params
        ${[path.basename(__dirname) + '/code.ts']}
        ${['../node_modules']}
        ${['-r', '.', 'dist']}
        ${['temp']}
        ${['-r', '.', 'temp']}
        ${['-r', '.']}
        ${[]}
        ${[' ']}
    `('app.run $params', async ({ params }) => {
        await app.run(['', '', ...params]);
        const stderr = error.mock.calls
            .map((c) => c.join(''))
            .join('\n')
            .replace(/\\/g, '/');
        const stdout = log.mock.calls
            .map((c) => c.join(''))
            .join('\n')
            .replace(/\\/g, '/');
        expect(stdout).toMatchSnapshot();
        expect(stderr).toMatchSnapshot();
    });

    test.each`
        params    | expected
        ${['-r']} | ${new Error('Missing root parameter.')}
    `('app.run errors $params', async ({ params, expected }) => {
        await expect(app.run(['', '', ...params])).rejects.toEqual(expected);
    });

    test('app.help', async () => {
        await app.run(['', '', '--help']);
        expect(error).toHaveBeenCalledTimes(0);
        expect(log.mock.calls).toMatchSnapshot();
    });
});
