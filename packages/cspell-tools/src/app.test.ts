import * as app from './app';
import * as Commander from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';

const projectRoot = path.join(__dirname, '..');
const pathSamples = path.join(projectRoot, '..', 'Samples', 'dicts');
const pathTemp = path.join(projectRoot, 'temp');

function argv(...args: string[]): string[] {
    return [...process.argv.slice(0, 2), ...args];
}

function getCommander() {
    return new Commander.Command;
}

describe('Validate the application', () => {
    test('test app compile-trie', async () => {
        const commander = getCommander();
        const log = jest.spyOn(console, 'log').mockImplementation();
        const args = argv('compile-trie', '-n', path.join(pathSamples, 'cities.txt'));
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        expect(log).toHaveBeenCalled();
        log.mockRestore();
    });

    test('test app compile-trie compress', async () => {
        const commander = getCommander();
        const log = jest.spyOn(console, 'log').mockImplementation();
        const args = argv('compile-trie', path.join(pathSamples, 'cities.txt'));
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        expect(log).toHaveBeenCalled();
        log.mockRestore();
    });

    test('test app compile-trie -o', async () => {
        const commander = getCommander();
        const log = jest.spyOn(console, 'log').mockImplementation();
        const args = argv('compile-trie', '-n', path.join(pathSamples, 'cities.txt'), '-o', pathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        expect(log).toHaveBeenCalled();
        log.mockRestore();
    });

    test('test app compile', async () => {
        const commander = getCommander();
        const log = jest.spyOn(console, 'log').mockImplementation();
        const args = argv('compile', '-n', path.join(pathSamples, 'cities.txt'), '-o', pathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        expect(log).toHaveBeenCalled();
        log.mockRestore();
    });

    test('test app compile-trie max depth', async () => {
        const commander = getCommander();
        const log = jest.spyOn(console, 'log').mockImplementation();
        const args = argv('compile-trie', '-n', '-m', '0', path.join(pathSamples, 'cities.txt'), '-o', pathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        expect(log).toHaveBeenCalled();
        log.mockRestore();
    });

    test('test app compile with compression', async () => {
        const commander = getCommander();
        const log = jest.spyOn(console, 'log').mockImplementation();
        const args = argv('compile', path.join(pathSamples, 'cities.txt'), '-o', pathTemp);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        expect(log).toHaveBeenCalled();
        log.mockRestore();
    });

    test('test app compile merge', async () => {
        const commander = getCommander();
        const targetDir = pathTemp;
        const target = 'merge.txt';
        const cities = path.join(pathSamples, 'cities.txt');
        const exampleHunspell = path.join(pathSamples, 'hunspell', 'example.dic');
        const log = jest.spyOn(console, 'log').mockImplementation();
        const args = argv('compile', '-n', '-M', target, cities, exampleHunspell, '-o', targetDir);
        await expect(app.run(commander, args)).resolves.toBeUndefined();
        const words = await fs.readFile(path.join(targetDir, target), 'utf8');
        expect(words).toMatchSnapshot();
        expect(log).toHaveBeenCalled();

        log.mockRestore();
    });

    test('test app no args', () => {
        const commander = getCommander();
        const mock = jest.fn();
        commander.on('--help', mock);
        expect(app.run(commander, argv())).rejects.toThrowError(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
    });

    test('test app --help', async () => {
        const commander = getCommander();
        const mock = jest.fn();
        commander.on('--help', mock);
        await expect(app.run(commander, argv('--help'))).rejects.toThrowError(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
    });

    test('test app -V', async () => {
        const commander = getCommander();
        const mock = jest.fn();
        commander.on('option:version', mock);
        await expect(app.run(commander, argv('-V')) ).rejects.toThrowError(Commander.CommanderError);
        expect(mock.mock.calls.length).toBe(1);
    });

});
