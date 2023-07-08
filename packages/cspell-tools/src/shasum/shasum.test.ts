import { describe, expect, test } from 'vitest';

import { resolvePathToFixture } from '../test/TestHelper.js';
import { checkShasumFile, reportCheckChecksumFile, reportChecksumForFiles } from './shasum.js';

describe('shasum', () => {
    test('checkShasumFile pass', async () => {
        const root = resolvePathToFixture('dicts');
        const filename = resolvePathToFixture('dicts/_checksum.txt');
        const result = await checkShasumFile(filename, [], root);
        expect(result.filter((r) => !r.passed)).toHaveLength(0);
        expect(result).toMatchSnapshot();
    });

    test('checkShasumFile pass with files', async () => {
        const root = resolvePathToFixture('dicts');
        const filename = resolvePathToFixture('dicts/_checksum.txt');
        const files = ['colors.txt', 'cities.txt'];
        const result = await checkShasumFile(filename, files, root);
        expect(result.filter((r) => !r.passed)).toHaveLength(0);
        expect(result.map((r) => r.filename)).toEqual(files);
        expect(result).toMatchSnapshot();
    });

    test('checkShasumFile pass with files but file not in checksum.txt', async () => {
        const root = resolvePathToFixture('dicts');
        const filename = resolvePathToFixture('dicts/_checksum.txt');
        const files = ['colors.txt', 'my_cities.txt'];
        const result = await checkShasumFile(filename, files, root);
        expect(result.filter((r) => !r.passed)).toHaveLength(1);
        expect(result.map((r) => r.filename)).toEqual(files);
        // console.error('%o', result);
    });

    test('checkShasumFile not pass', async () => {
        const root = resolvePathToFixture('dicts');
        const filename = resolvePathToFixture('dicts/_checksum-failed.txt');
        const result = await checkShasumFile(filename, [], root);
        expect(result.filter((r) => !r.passed)).toHaveLength(1);
        expect(result).toMatchSnapshot();
    });

    test('checkShasumFile missing files', async () => {
        const root = resolvePathToFixture('dicts');
        const filename = resolvePathToFixture('dicts/_checksum-missing-file.txt');
        const result = await checkShasumFile(filename, [], root);
        // console.error('%o', result);
        expect(result.filter((r) => !r.passed)).toHaveLength(1);
        const missingResult = result[0];
        expect(missingResult.error).toEqual(Error('Failed to read file.'));
    });

    test('checkShasumFile bad format', async () => {
        const root = resolvePathToFixture('dicts');
        const filename = resolvePathToFixture('dicts/_checksum-bad-format.txt');
        await expect(checkShasumFile(filename, [], root)).rejects.toEqual(
            Error('Failed to parse line 3 of checksum file.')
        );
    });

    test('reportChecksumForFiles', async () => {
        const root = resolvePathToFixture('dicts');
        const files = ['colors.txt', 'cities.txt'];
        const report = await reportChecksumForFiles(files, root);
        expect(report).toMatchSnapshot();
    });

    test.each`
        filename                        | files
        ${'_checksum.txt'}              | ${undefined}
        ${'_checksum.txt'}              | ${['colors.txt', 'my_cities.txt']}
        ${'_checksum-failed.txt'}       | ${undefined}
        ${'_checksum-failed2.txt'}      | ${undefined}
        ${'_checksum-failed2.txt'}      | ${['colors.txt', 'cities.txt']}
        ${'_checksum-missing-file.txt'} | ${undefined}
    `('reportCheckChecksumFile $filename $files', async ({ filename, files }) => {
        const root = resolvePathToFixture('dicts');
        const report = await reportCheckChecksumFile(resolvePathToFixture('dicts', filename), files, root);
        expect(report).toMatchSnapshot();
    });
});
