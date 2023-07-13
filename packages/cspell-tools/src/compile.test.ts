import { writeFile } from 'node:fs/promises';

import { describe, expect, test, vi } from 'vitest';

import { processCompileAction } from './compile.js';

vi.mock('node:fs/promises', () => ({
    writeFile: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
}));

const mockWriteFile = vi.mocked(writeFile);

vi.spyOn(console, 'log').mockImplementation(() => undefined);

describe('compile', () => {
    test('--init option', async () => {
        const options = {
            compress: true,
            sort: true,
            merge: 'public-licenses',
            output: '.',
            listFile: ['source-files.txt'],
            init: true,
        };
        const expected = `\
targets:
  - name: public-licenses
    targetDirectory: .
    compress: true
    format: plaintext
    sources:
      - listFile: source-files.txt
    sort: true
`;
        await processCompileAction([], options, undefined);
        expect(mockWriteFile).toHaveBeenLastCalledWith('cspell-tools.config.yaml', expected);
    });
});
