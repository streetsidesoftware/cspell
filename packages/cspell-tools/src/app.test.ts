import * as Commander from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as shell from 'shelljs';
import * as app from './app';
import { readTextFile } from './compiler/readTextFile';
import { getSystemFeatureFlags } from './FeatureFlags';
import { spyOnConsole } from './test/console';
import { createTestHelper } from './test/TestHelper';

const testHelper = createTestHelper(__filename);

const projectRoot = testHelper.packageRoot;
const relPathTemp = 'app-out';
const pathSamples = path.join(projectRoot, '../Samples/dicts');

function pathTemp(...parts: string[]) {
    return testHelper.resolveTemp(...parts);
}

function argv(...args: string[]): string[] {
    return [...process.argv.slice(0, 2), ...args];
}

function getCommander() {
    return new Commander.Command();
}

const { consoleOutput } = spyOnConsole();

getSystemFeatureFlags().setFlag('enable-config', false);
getSystemFeatureFlags().setFlag('enable-config', true);

describe('Validate the application', () => {
    beforeAll(() => {
        testHelper.clearTempDir();
    });

    beforeEach(() => {
        testHelper.createTempDir();
        testHelper.cp(path.join(pathSamples, 'cities.txt'), '.');
        testHelper.cd('.');
        jest.resetAllMocks();
    });

    test('app compile-trie', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', '-n', 'cities.txt');
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie compress', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', 'cities.txt');
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie -o', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', '-n', 'cities.txt', '-o', relPathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile', async () => {
        const commander = getCommander();
        const args = argv('compile', '-n', 'cities.txt', '-o', relPathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie max depth', async () => {
        const commander = getCommander();
        const args = argv('compile-trie', '-n', '-m', '0', 'cities.txt', '-o', relPathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile-trie compound', async () => {
        const commander = getCommander();
        const argsBase = argv(
            'compile-trie',
            '-n',
            '--trie3',
            '--trie-base=10',
            '--experimental=compound',
            '-o',
            pathTemp(),
            'cities.txt'
        );
        const args = argsBase.concat(['--experimental=enable-config:false', '--merge=out/cities.compound']);
        const ff = getSystemFeatureFlags().fork();
        await expect(app.run(commander, args, ff)).resolves.toBeUndefined();
        const words = await readTextFile(path.join(pathTemp(), 'out/cities.compound.trie'));
        expect(words).toMatchSnapshot();

        const args2 = argsBase.concat(['--experimental=enable-config:true', '--merge=out/cities.compound2']);
        await expect(app.run(commander, args2, ff)).resolves.toBeUndefined();
        const words2 = await readTextFile(path.join(pathTemp(), 'out/cities.compound2.trie'));
        expect(words2).toEqual(words);
    });

    test('app compile compound', async () => {
        const commander = getCommander();
        const args = argv(
            'compile',
            '-n',
            '--experimental',
            'compound',
            '--merge',
            'out/cities.compound',
            'cities.txt'
        );
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await readTextFile(path.join(pathTemp(), 'out/cities.compound.txt'));
        expect(words).toMatchSnapshot();
    });

    test('app compile with compression', async () => {
        const commander = getCommander();
        const args = argv('compile', 'cities.txt', '-o', relPathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await readTextFile(path.join(relPathTemp, 'cities.txt.gz'));
        expect(words).toMatchSnapshot();
    });

    test('app compile merge legacy', async () => {
        const commander = getCommander();
        const targetDir = relPathTemp;
        const target = 'merge.txt';
        const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const args = argv(
            'compile',
            '-n',
            '--use-legacy-splitter',
            '-M',
            target,
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
        const targetDir = relPathTemp;
        const target = 'merge.txt';
        const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const args = argv('compile', '-n', '--split', '-M', target, cities, exampleHunspell, '-o', targetDir);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
    });

    test('app compile merge with defaults', async () => {
        const commander = getCommander();
        const targetDir = relPathTemp;
        const target = 'merge.txt';
        const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const args = argv('compile', '-n', '-M', target, cities, exampleHunspell, '-o', targetDir);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
    });

    test('app compile merge with defaults --keep-raw-case', async () => {
        const commander = getCommander();
        const targetDir = relPathTemp;
        const target = 'merge.txt';
        const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const args = argv('compile', '--keep-raw-case', '-n', '-M', target, cities, exampleHunspell, '-o', targetDir);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
    });

    test('app no args', async () => {
        const commander = getCommander();
        const mock = jest.fn();
        commander.on('--help', mock);
        await expect(app.run(commander, argv())).rejects.toThrow(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('app --help', async () => {
        const commander = getCommander();
        const mock = jest.fn();
        commander.on('--help', mock);
        await expect(app.run(commander, argv('--help'))).rejects.toThrow(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
        expect(consoleOutput()).toMatchSnapshot();
    });

    test('app -V', async () => {
        const commander = getCommander();
        const mock = jest.fn();
        commander.on('option:version', mock);
        await expect(app.run(commander, argv('-V'))).rejects.toThrow(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
        expect(consoleOutput()).toMatchSnapshot();
    });
});
