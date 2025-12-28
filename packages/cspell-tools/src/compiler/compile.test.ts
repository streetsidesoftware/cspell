import * as path from 'node:path';

import { beforeAll, beforeEach, describe, expect, test } from 'vitest';

import type { CompileRequest, Target } from '../config/index.ts';
import { checkShasumFile } from '../shasum/shasum.ts';
import { spyOnConsole } from '../test/console.ts';
import { createTestHelper } from '../test/TestHelper.ts';
import { compile } from './compile.ts';
import { setLogger } from './logger.ts';
import { readTextFile } from './readers/readTextFile.ts';

const testHelper = createTestHelper(import.meta.url);

const pathSamples = path.join(testHelper.packageRoot, '../Samples/dicts');

function sample(...parts: string[]): string {
    return path.resolve(pathSamples, ...parts);
}

function fix(...parts: string[]): string {
    return testHelper.resolveFixture(...parts);
}

const consoleSpy = spyOnConsole();

describe('compile', () => {
    beforeAll(() => {
        consoleSpy.attach();
    });

    beforeEach(() => {
        testHelper.clearTempDir();
        setLogger(() => undefined);
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
        'compile conditional $file fmt: $format gz: $compress alt: $generateNonStrict',
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
                rootDir: targetDirectory,
                checksumFile: true,
            };

            await compile(req, { conditionalBuild: true });

            const ext = (format === 'plaintext' ? '.txt' : '.trie') + ((compress && '.gz') || '');
            const content = await readTextFile(`${targetDirectory}/myDictionary${ext}`);
            expect(content).toMatchSnapshot();
            const check = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
            expect(check.passed).toBe(true);

            await compile(req, { conditionalBuild: true });
            const check2 = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
            expect(check2.passed).toBe(true);
        },
    );

    test.each`
        file                  | excludeWordsFrom
        ${'dicts/colors.txt'} | ${['build-exclude/src/exclude.txt']}
        ${'dicts/cities.txt'} | ${['build-exclude/src/exclude.txt']}
    `('compile filtered $file, excludeWordsFrom: $excludeWordsFrom', async ({ file, excludeWordsFrom }) => {
        const targetDirectory = t(`.`);
        const target: Target = {
            name: 'myDictionary',
            targetDirectory,
            format: 'plaintext',
            sources: [fix(file)],
            compress: false,
            trieBase: 10,
            sort: true,
            excludeWordsFrom: excludeWordsFrom.map((f: string) => fix(f)),
        };
        const req: CompileRequest = {
            targets: [target],
            rootDir: targetDirectory,
            checksumFile: true,
        };

        await compile(req, { conditionalBuild: true });

        const ext = '.txt';
        const content = await readTextFile(`${targetDirectory}/myDictionary${ext}`);
        expect(content).toMatchSnapshot();
        const check = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
        expect(check.passed).toBe(true);

        await compile(req, { conditionalBuild: true });
        const check2 = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
        expect(check2.passed).toBe(true);
    });

    test.each`
        file                  | excludeWordsNotFoundIn
        ${'dicts/colors.txt'} | ${['build-exclude/src/exclude.txt']}
        ${'dicts/cities.txt'} | ${['build-exclude/src/exclude.txt']}
    `(
        'compile filtered $file, excludeWordsNotFoundIn: $excludeWordsNotFoundIn',
        async ({ file, excludeWordsNotFoundIn }) => {
            const targetDirectory = t(`.`);
            const target: Target = {
                name: 'myDictionary',
                targetDirectory,
                format: 'plaintext',
                sources: [fix(file)],
                compress: false,
                trieBase: 10,
                sort: true,
                excludeWordsNotFoundIn: excludeWordsNotFoundIn.map((f: string) => fix(f)),
            };
            const req: CompileRequest = {
                targets: [target],
                rootDir: targetDirectory,
                checksumFile: true,
            };

            await compile(req, { conditionalBuild: true });

            const ext = '.txt';
            const content = await readTextFile(`${targetDirectory}/myDictionary${ext}`);
            expect(content).toMatchSnapshot();
            const check = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
            expect(check.passed).toBe(true);

            await compile(req, { conditionalBuild: true });
            const check2 = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
            expect(check2.passed).toBe(true);
        },
    );

    test.each`
        file                  | excludeWordsMatchingRegex
        ${'dicts/colors.txt'} | ${[/^[rg]/.toString()]}
        ${'dicts/colors.txt'} | ${[/^(?!red|green|low)/.toString()]}
        ${'dicts/cities.txt'} | ${['/^[lL]/']}
    `(
        'compile filtered $file, excludeWordsMatchingRegex: $excludeWordsMatchingRegex',
        async ({ file, excludeWordsMatchingRegex }) => {
            const targetDirectory = t(`.`);
            const target: Target = {
                name: 'myDictionary',
                targetDirectory,
                format: 'plaintext',
                sources: [fix(file)],
                compress: false,
                trieBase: 10,
                sort: true,
                excludeWordsMatchingRegex,
            };
            const req: CompileRequest = {
                targets: [target],
                rootDir: targetDirectory,
                checksumFile: true,
            };

            await compile(req, { conditionalBuild: true });

            const ext = '.txt';
            const content = await readTextFile(`${targetDirectory}/myDictionary${ext}`);
            expect(content).toMatchSnapshot();
            const check = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
            expect(check.passed).toBe(true);

            await compile(req, { conditionalBuild: true });
            const check2 = await checkShasumFile(path.join(targetDirectory, 'checksum.txt'), [], targetDirectory);
            expect(check2.passed).toBe(true);
        },
    );
});

function t(...parts: string[]): string {
    return testHelper.resolveTemp(...parts);
}
