import * as Commander from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import * as app from './app.js';
import { readTextFile } from './compiler/readers/readTextFile.js';
import { getSystemFeatureFlags } from './FeatureFlags/index.js';
import { spyOnConsole } from './test/console.js';
import { createTestHelper } from './test/TestHelper.js';
import { compressFile } from './gzip/compressFiles.js';

vi.mock('./gzip/compressFiles.js', () => ({
    compressFile: vi.fn().mockImplementation((name: string) => Promise.resolve(name + '.gz')),
}));

const mockedCompressFile = vi.mocked(compressFile);

const testHelper = createTestHelper(import.meta.url);

const projectRoot = testHelper.packageRoot;
const _relPathTemp = 'app-out';
const pathSamples = path.join(projectRoot, '../Samples/dicts');

function relPathTemp(...parts: string[]) {
    return pathTemp(_relPathTemp, ...parts);
}

function pathTemp(...parts: string[]) {
    return testHelper.resolveTemp(...parts);
}

function argv(...args: string[]): string[] {
    return [...process.argv.slice(0, 2), ...args];
}

function getCommander() {
    return new Commander.Command();
}

const consoleSpy = spyOnConsole();

describe('Validate the application', () => {
    beforeAll(() => {
        testHelper.clearTempDir();
    });

    beforeEach(() => {
        testHelper.createTempDir();
        testHelper.cp(path.join(pathSamples, 'cities.txt'), '.');
        vi.resetAllMocks();
        consoleSpy.attach();
    });

    test('app compile-trie', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', '-n', 'cities.txt', '-o', pathTemp());
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie compress', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', 'cities.txt', '-o', pathTemp());
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie -o', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', '-n', 'cities.txt', '-o', relPathTemp());
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile', async () => {
        const commander = getCommander();
        const args = argv('compile', '-n', 'cities.txt', '-o', relPathTemp());
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie max depth', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', '-n', '-m', '0', 'cities.txt', '-o', relPathTemp());
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie compound', async () => {
        const commander = getCommander();
        const args = argv(
            'compile-trie',
            '-n',
            '--trie3',
            '--trie-base=10',
            '--experimental=compound',
            '--merge=out/cities.compound',
            pathTemp('cities.txt'),
            '-o',
            pathTemp()
        );
        const ff = getSystemFeatureFlags().fork();
        await expect(app.run(commander, args, ff)).resolves.toBeUndefined();
        const words = await readTextFile(pathTemp('out/cities.compound.trie'));
        expect(words).toMatchSnapshot();
    });

    test('app compile compound', async () => {
        const commander = getCommander();
        const args = argv(
            'compile',
            '-n',
            '--experimental',
            'compound',
            '--merge=out/cities.compound',
            pathTemp('cities.txt'),
            '-o',
            pathTemp()
        );
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await readTextFile(pathTemp('out/cities.compound.txt'));
        expect(words).toMatchSnapshot();
    });

    test('app compile with compression', async () => {
        const commander = getCommander();
        const args = argv('compile', pathTemp('cities.txt'), '-o', relPathTemp());
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await readTextFile(relPathTemp('cities.txt.gz'));
        expect(words).toMatchSnapshot();
    });

    test('app compile merge legacy', async () => {
        const commander = getCommander();
        const targetDir = relPathTemp();
        const name = 'merge';
        const target = name + '.txt';
        const pathSamples = path.join(projectRoot, '../Samples/dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell/example.dic');
        const args = argv(
            'compile',
            '-n',
            '--use-legacy-splitter',
            '-M',
            name,
            cities,
            exampleHunspell,
            '-o',
            targetDir
        );
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
    });

    test('app compile merge', async () => {
        const commander = getCommander();
        const targetDir = relPathTemp();
        const name = 'merge';
        const target = name + '.txt';
        const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const args = argv('compile', '-n', '--split', '-M', name, cities, exampleHunspell, '-o', targetDir);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
    });

    test('app compile merge with defaults', async () => {
        const commander = getCommander();
        const targetDir = relPathTemp();
        const name = 'merge';
        const target = name + '.txt';
        const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const args = argv('compile', '-n', '-M', name, cities, exampleHunspell, '-o', targetDir);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
    });

    test('app compile merge with defaults --keep-raw-case', async () => {
        const commander = getCommander();
        const targetDir = relPathTemp();
        const name = 'merge';
        const target = name + '.txt';
        const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const args = argv('compile', '--keep-raw-case', '-n', '-M', name, cities, exampleHunspell, '-o', targetDir);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
    });

    test('app no args', async () => {
        const commander = getCommander();
        const mock = vi.fn();
        commander.on('--help', mock);
        await expect(app.run(commander, argv())).rejects.toThrow(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
        expect(consoleSpy.consoleOutput()).toMatchSnapshot();
    });

    test('app --help', async () => {
        const commander = getCommander();
        const mock = vi.fn();
        commander.on('--help', mock);
        await expect(app.run(commander, argv('--help'))).rejects.toThrow(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
        expect(consoleSpy.consoleOutput()).toMatchSnapshot();
    });

    test('app -V', async () => {
        const commander = getCommander();
        const mock = vi.fn();
        commander.on('option:version', mock);
        await expect(app.run(commander, argv('-V'))).rejects.toThrow(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
        expect(consoleSpy.consoleOutput()).toMatchSnapshot();
    });

    test('app gzip', async () => {
        const commander = getCommander();
        const args = argv('gzip', 'README.md', 'package.json');

        await expect(app.run(commander, args)).resolves.toBeUndefined();
        expect(mockedCompressFile).toHaveBeenCalledWith('README.md');
        expect(mockedCompressFile).toHaveBeenCalledWith('package.json');
    });
});
