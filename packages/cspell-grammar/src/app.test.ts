import * as path from 'path';

import { run } from './app';

describe('app', () => {
    test.each`
        filename
        ${'TypeScript/sample1.ts'}
    `('app $filename', async ({ filename }) => {
        const log = jest.spyOn(console, 'log').mockImplementation();
        await run(['', '', r(filename)]);
        expect(log.mock.calls.map((c) => c.join(';')).join('\n')).toMatchSnapshot();
        log.mockRestore();
    });
});

function r(file: string): string {
    return path.resolve(path.join(__dirname, '..', 'fixtures'), file);
}
