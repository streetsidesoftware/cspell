import { writeFile } from 'node:fs/promises';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { resolvePathToFixture } from '../test/TestHelper.js';
import {
    calcUpdateChecksumForFiles,
    checkShasumFile,
    reportCheckChecksumFile,
    reportChecksumForFiles,
    updateChecksumForFiles,
} from './shasum.js';

vi.mock('node:fs/promises', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fs: any = await vi.importActual('node:fs/promises');
    return {
        ...fs,
        writeFile: vi.fn().mockImplementation(() => Promise.resolve(undefined)),
    };
});

const mockedWriteFile = vi.mocked(writeFile);

describe('shasum', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });

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
        const report = await reportChecksumForFiles(files, { root });
        expect(report).toMatchSnapshot();
    });

    test.each`
        filename                        | files                              | listFile
        ${'_checksum.txt'}              | ${undefined}                       | ${undefined}
        ${'_checksum.txt'}              | ${['colors.txt', 'my_cities.txt']} | ${undefined}
        ${'_checksum-failed.txt'}       | ${undefined}                       | ${undefined}
        ${'_checksum-failed2.txt'}      | ${undefined}                       | ${undefined}
        ${'_checksum-failed2.txt'}      | ${['cities.txt', 'colors.txt']}    | ${undefined}
        ${'_checksum-missing-file.txt'} | ${undefined}                       | ${undefined}
        ${'_checksum.txt'}              | ${['colors.txt', 'my_cities.txt']} | ${'source-files.txt'}
    `('reportCheckChecksumFile $filename $files $listFile', async ({ filename, files, listFile }) => {
        const root = resolvePathToFixture('dicts');
        const report = await reportCheckChecksumFile(resolvePathToFixture('dicts', filename), files, {
            root,
            listFile: listFile ? [resolvePathToFixture('dicts', listFile)] : undefined,
        });
        expect(report).toMatchSnapshot();
    });

    test.each`
        filename
        ${'_checksum-failed.txt'}
        ${'_checksum-missing-file'}
        ${'new_checksum_file.txt'}
    `('calcUpdateChecksumForFiles $filename', async ({ filename }) => {
        const root = resolvePathToFixture('dicts');
        const checksumFile = resolvePathToFixture('dicts', filename);
        const listFile = resolvePathToFixture('dicts', 'source-files.txt');

        const result = await calcUpdateChecksumForFiles(checksumFile, [], { root, listFile: [listFile] });
        expect(result).toMatchSnapshot();
    });

    test('updateChecksumForFiles', async () => {
        const checksumFile = 'temp/my-checksum.txt';
        const root = resolvePathToFixture('dicts');
        const listFile = resolvePathToFixture('dicts', 'source-files.txt');

        const result = await updateChecksumForFiles(checksumFile, [], { root, listFile: [listFile] });
        expect(mockedWriteFile).toHaveBeenLastCalledWith(checksumFile, result.report);
    });
});
