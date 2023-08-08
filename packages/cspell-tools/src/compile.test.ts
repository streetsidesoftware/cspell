import { writeFile } from 'node:fs/promises';

import { describe, expect, test, vi } from 'vitest';

import { configFileHeader, processCompileAction } from './compile.js';
import { configFileSchemaURL } from './config/config.js';

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
        const expected =
            configFileHeader +
            `\
$schema: ${configFileSchemaURL}
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

    test('--init option', async () => {
        const options = {
            compress: false,
            trie3: true,
            experimental: ['compound'],
            sort: true,
            merge: 'nl-nl',
            output: '.',
            listFile: ['src\\source-files.txt'],
            init: true,
            max_depth: '5',
        };
        const expected =
            configFileHeader +
            `\
$schema: ${configFileSchemaURL}
targets:
  - name: nl-nl
    targetDirectory: .
    compress: false
    format: trie3
    sources:
      - listFile: src/source-files.txt
    generateNonStrict: true
maxDepth: 5
`;
        await processCompileAction([], options, undefined);
        expect(mockWriteFile).toHaveBeenLastCalledWith('cspell-tools.config.yaml', expected);
    });
});
