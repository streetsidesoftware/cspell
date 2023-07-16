import * as path from 'path';
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { CompileRequest, Target } from '../config/index.js';
import { spyOnConsole } from '../test/console.js';
import { createTestHelper } from '../test/TestHelper.js';
import { compile } from './compile.js';
import { readTextFile } from './readers/readTextFile.js';

const testHelper = createTestHelper(import.meta.url);

const pathSamples = path.join(testHelper.packageRoot, '../Samples/dicts');

function sample(...parts: string[]): string {
    return path.resolve(pathSamples, ...parts);
}

const consoleSpy = spyOnConsole();

describe('compile', () => {
    beforeAll(() => {
        consoleSpy.attach();
    });

    beforeEach(() => {
        testHelper.clearTempDir();
    });

    test.each`
        file                   | format         | compress | generateNonStrict
        ${'cities.txt'}        | ${'plaintext'} | ${false} | ${true}
        ${'cities.txt'}        | ${'plaintext'} | ${true}  | ${true}
        ${'cities.txt'}        | ${'plaintext'} | ${false} | ${undefined}
        ${'cities.txt'}        | ${'plaintext'} | ${true}  | ${undefined}
        ${'cities.txt'}        | ${'trie3'}     | ${false} | ${undefined}
        ${'sampleCodeDic.txt'} | ${'plaintext'} | ${false} | ${undefined}
        ${'sampleCodeDic.txt'} | ${'plaintext'} | ${false} | ${true}
    `(
        'compile $file fmt: $format gz: $compress alt: $generateNonStrict',
        async ({ format, file, generateNonStrict, compress }) => {
            const targetDirectory = t(`.`);
            const target: Target = {
                name: 'myDictionary',
                targetDirectory,
                format,
                sources: [sample(file)],
                compress,
                generateNonStrict,
                trieBase: 10,
                sort: true,
            };
            const req: CompileRequest = {
                targets: [target],
            };

            await compile(req);

            const ext = (format === 'plaintext' ? '.txt' : '.trie') + ((compress && '.gz') || '');
            const content = await readTextFile(`${targetDirectory}/myDictionary${ext}`);
            expect(content).toMatchSnapshot();
        },
    );
});

function t(...parts: string[]): string {
    return testHelper.resolveTemp(...parts);
}
