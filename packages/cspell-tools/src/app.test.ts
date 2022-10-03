import * as Commander from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as shell from 'shelljs';
import * as app from './app';
import { getSystemFeatureFlags } from './FeatureFlags';
import { spyOnConsole } from './test/console';

const projectRoot = path.join(__dirname, '..');
const _pathTemp = path.join(projectRoot, 'temp/cspell-tools', path.basename(__filename));
const relPathTemp = 'app-out';
const pathSamples = path.join(projectRoot, '../Samples/dicts');

function pathTemp() {
    const test = expect.getState().currentTestName || '';
    return path.join(_pathTemp, test.replace(/[^\w_.-]/, '_'));
}

function argv(...args: string[]): string[] {
    return [...process.argv.slice(0, 2), ...args];
}

function getCommander() {
    return new Commander.Command();
}

const { consoleOutput } = spyOnConsole();

getSystemFeatureFlags().setFlag('enable-config', false);

describe('Validate the application', () => {
    beforeAll(() => {
        shell.rm('rf', _pathTemp);
    });

    beforeEach(() => {
        const pTemp = pathTemp();
        shell.mkdir('-p', pTemp);
        shell.cp(path.join(pathSamples, 'cities.txt'), pTemp);
        shell.cd(pTemp);
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
        const args = argv(
            'compile-trie',
            '-n',
            '--trie3',
            '--experimental',
            'compound',
            '--merge',
            path.join('temp', 'cities.compound'),
            '-o',
            pathTemp(),
            'cities.txt'
        );
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile compound', async () => {
        const commander = getCommander();
        const args = argv(
            'compile',
            '-n',
            '--experimental',
            'compound',
            '--merge',
            path.join(pathTemp(), 'cities.compound'),
            'cities.txt'
        );
        await expect(app.run(commander, args)).resolves.toBeUndefined();
    });

    test('app compile with compression', async () => {
        const commander = getCommander();
        const args = argv('compile', 'cities.txt', '-o', relPathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
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
