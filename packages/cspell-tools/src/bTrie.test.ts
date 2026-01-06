import fsPath from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { generateBTrie } from './bTrie.ts';
import { spyOnConsole } from './test/console.ts';
import { resolvePathToFixture } from './test/TestHelper.ts';
import { writeFile } from './util/writeFile.ts';

vi.mock('./util/writeFile.ts');

const consoleSpy = spyOnConsole();

describe('bTrie', () => {
    const mockedWriteFile = vi.mocked(writeFile).mockImplementation(() => Promise.resolve());

    beforeEach(() => {
        consoleSpy.attach();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    test.each`
        src                       | compress | output       | expectedFilename
        ${'cities.txt'}           | ${false} | ${undefined} | ${'cities.btrie'}
        ${'cities.trie'}          | ${true}  | ${undefined} | ${'cities.btrie.gz'}
        ${'cities.trie.gz'}       | ${false} | ${'.'}       | ${'cities.btrie'}
        ${'hunspell/example.aff'} | ${false} | ${undefined} | ${'example.btrie'}
    `('generateBTrie', async ({ src, compress, output, expectedFilename }) => {
        const fixturePath = resolvePathToFixture('dicts', src);
        const expectedDir = output ? fsPath.resolve(output) : fsPath.dirname(fixturePath);
        await generateBTrie([fixturePath], { output, compress });
        expect(mockedWriteFile).toHaveBeenCalledTimes(1);
        const expectedFileName = fsPath.join(expectedDir, expectedFilename);
        expect(mockedWriteFile).toHaveBeenCalledWith(expectedFileName, expect.any(Uint8Array));
    });
});
