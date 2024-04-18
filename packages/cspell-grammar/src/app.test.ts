import * as path from 'node:path';

import { describe, expect, test, vi } from 'vitest';

import { run } from './app.js';

describe('app', () => {
    test.each`
        filename
        ${'TypeScript/sample1.ts'}
    `('app $filename', async ({ filename }) => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        await run(['', '', r(filename)]);
        expect(log.mock.calls.map((c) => c.join(';')).join('\n')).toMatchSnapshot();
        log.mockRestore();
    });
});

function r(file: string): string {
    return path.resolve(path.join(__dirname, '..', 'fixtures'), file);
}
