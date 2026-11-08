import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

import { Command } from 'commander';
import { cspellConfigFileSchema } from 'cspell-config-lib';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { run } from './app.mjs';
import { pathPackageRoot } from './test/test.helper.js';

const execFileAsync = promisify(execFile);

const oldSchema = 'https://example.com/old.schema.json';
const yamlSchemaComment = `# yaml-language-server: $schema=${cspellConfigFileSchema}`;

describe('cspell init', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cspell-init-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    async function init(fileName: string, ...args: string[]): Promise<string> {
        const filePath = path.join(tempDir, fileName);
        const format = path.extname(fileName).slice(1);
        await run(new Command(), [...process.argv.slice(0, 2), 'init', '-o', filePath, '--format', format, ...args]);
        return fs.readFile(filePath, 'utf8');
    }

    async function writeConfig(fileName: string, content: string): Promise<void> {
        await fs.writeFile(path.join(tempDir, fileName), content);
    }

    test.each`
        args               | expected
        ${[]}              | ${cspellConfigFileSchema}
        ${['--schema']}    | ${cspellConfigFileSchema}
        ${['--no-schema']} | ${undefined}
    `('new JSON file $args', async ({ args, expected }) => {
        const content = await init('cspell.json', ...args);
        expect(JSON.parse(content).$schema).toBe(expected);
    });

    test.each`
        args               | expected
        ${[]}              | ${undefined}
        ${['--schema']}    | ${cspellConfigFileSchema}
        ${['--no-schema']} | ${undefined}
    `('existing JSON file without a schema $args', async ({ args, expected }) => {
        await writeConfig('cspell.json', '{ "words": ["one"] }\n');
        const content = await init('cspell.json', ...args);
        expect(JSON.parse(content).$schema).toBe(expected);
        expect(JSON.parse(content).words).toEqual(['one']);
    });

    test.each`
        args               | expected
        ${[]}              | ${oldSchema}
        ${['--schema']}    | ${cspellConfigFileSchema}
        ${['--no-schema']} | ${oldSchema}
    `('existing JSON file with a schema $args', async ({ args, expected }) => {
        await writeConfig('cspell.json', JSON.stringify({ $schema: oldSchema }));
        const content = await init('cspell.json', ...args);
        expect(JSON.parse(content).$schema).toBe(expected);
    });

    test.each`
        args               | expected
        ${[]}              | ${true}
        ${['--no-schema']} | ${false}
    `('new YAML file $args', async ({ args, expected }) => {
        const content = await init('cspell.config.yaml', ...args);
        expect(content.includes(yamlSchemaComment)).toBe(expected);
    });

    test.each`
        args            | expected
        ${[]}           | ${false}
        ${['--schema']} | ${true}
    `('existing YAML file without a schema $args', async ({ args, expected }) => {
        await writeConfig('cspell.config.yaml', 'words:\n  - one\n');
        const content = await init('cspell.config.yaml', ...args);
        expect(content.includes(yamlSchemaComment)).toBe(expected);
    });

    async function initConfig(fileName: string, ...args: string[]): Promise<string> {
        const filePath = path.join(tempDir, fileName);
        await run(new Command(), [...process.argv.slice(0, 2), 'init', '--config', filePath, ...args]);
        return fs.readFile(filePath, 'utf8');
    }

    const newFileSettings = { $schema: cspellConfigFileSchema, version: '0.2', language: 'en' };

    test.each`
        fileName
        ${'cspell.json'}
        ${'cspell.jsonc'}
    `('new $fileName with --config', async ({ fileName }) => {
        expect(JSON.parse(await initConfig(fileName, '--no-comments'))).toEqual(newFileSettings);
    });

    test('new JSON file with --output and the default format', async () => {
        const filePath = path.join(tempDir, 'cspell.json');
        await run(new Command(), [...process.argv.slice(0, 2), 'init', '--output', filePath]);
        expect(JSON.parse(await fs.readFile(filePath, 'utf8'))).toEqual(newFileSettings);
    });

    test('existing JSON file only changes what was asked for', async () => {
        await writeConfig('cspell.json', '{ "words": ["one"] }\n');
        expect(JSON.parse(await initConfig('cspell.json'))).toEqual({ words: ['one'] });
        expect(JSON.parse(await initConfig('cspell.json', '--locale', 'en-GB'))).toEqual({
            words: ['one'],
            language: 'en-GB',
        });
    });

    test('existing YAML file is unchanged', async () => {
        const content = 'words:\n  - one\n';
        await writeConfig('cspell.config.yaml', content);
        expect(await initConfig('cspell.config.yaml')).toBe(content);
    });

    test('existing file with no settings is initialized', async () => {
        await writeConfig('cspell.json', '{}\n');
        expect(JSON.parse(await initConfig('cspell.json'))).toEqual(newFileSettings);
    });

    test('package.json without a cspell section gets one', async () => {
        await writeConfig('package.json', '{ "name": "sample" }\n');
        expect(JSON.parse(await initConfig('package.json'))).toEqual({
            name: 'sample',
            cspell: { version: '0.2', language: 'en' },
        });
    });

    test('package.json with a cspell section is unchanged', async () => {
        const packageJson = { name: 'sample', cspell: { words: ['one'] } };
        await writeConfig('package.json', JSON.stringify(packageJson));
        expect(JSON.parse(await initConfig('package.json'))).toEqual(packageJson);
    });

    describe('without a path', () => {
        const codeConfig = 'export default { words: ["one"] };\n';

        async function initHere(...args: string[]): Promise<void> {
            await execFileAsync(process.execPath, [path.join(pathPackageRoot, 'bin.mjs'), 'init', ...args], {
                cwd: tempDir,
            });
        }

        function readHere(fileName: string): Promise<string> {
            return fs.readFile(path.join(tempDir, fileName), 'utf8');
        }

        async function writeHere(fileName: string, content: string): Promise<void> {
            await fs.mkdir(path.dirname(path.join(tempDir, fileName)), { recursive: true });
            await writeConfig(fileName, content);
        }

        test('creates the default file when there is no config', async () => {
            await initHere();
            expect(await fs.readdir(tempDir)).toEqual(['cspell.config.yaml']);
        });

        test.each`
            fileName
            ${'cspell.json'}
            ${'.cspell.config.yaml'}
            ${'.vscode/cspell.json'}
            ${'.config/cspell.yaml'}
        `('updates $fileName', async ({ fileName }) => {
            await writeHere(fileName, '{ "words": ["one"] }\n');
            await initHere('--locale', 'en-GB');
            expect(await readHere(fileName)).toContain('en-GB');
            expect(await fs.readdir(tempDir)).not.toContain('cspell.config.yaml');
        });

        test('updates the file cspell would load', async () => {
            await writeHere('cspell.json', '{ "words": ["one"] }\n');
            await writeHere('cspell.config.yaml', 'words:\n  - two\n');
            await initHere('--locale', 'en-GB');
            expect(await readHere('cspell.json')).toContain('en-GB');
            expect(await readHere('cspell.config.yaml')).not.toContain('en-GB');
        });

        test('package.json counts only with a cspell section', async () => {
            await writeHere('package.json', '{ "name": "sample" }\n');
            await initHere();
            expect(JSON.parse(await readHere('package.json'))).toEqual({ name: 'sample' });
            expect(await readHere('cspell.config.yaml')).toContain('version');

            await fs.rm(path.join(tempDir, 'cspell.config.yaml'));
            await writeHere('package.json', '{ "name": "sample", "cspell": { "words": ["one"] } }\n');
            await initHere('--locale', 'en-GB');
            expect(JSON.parse(await readHere('package.json')).cspell.language).toBe('en-GB');
            expect(await fs.readdir(tempDir)).toEqual(['package.json']);
        });

        test.each`
            args                      | fileName
            ${['--output', 'o.json']} | ${'o.json'}
            ${['--format', 'jsonc']}  | ${'cspell.jsonc'}
        `('$args creates a new file', async ({ args, fileName }) => {
            await writeHere('cspell.json', '{ "words": ["one"] }\n');
            await initHere(...args);
            expect(await readHere('cspell.json')).toBe('{ "words": ["one"] }\n');
            expect(await readHere(fileName)).toContain('version');
        });

        test('writes nothing for a code config when no change is requested', async () => {
            await writeHere('cspell.config.mjs', codeConfig);
            await initHere();
            expect(await fs.readdir(tempDir)).toEqual(['cspell.config.mjs']);
        });

        test('imports a code config into a new file with only what was asked for', async () => {
            await writeHere('cspell.config.mjs', codeConfig);
            await initHere('--locale', 'en-GB', '--no-comments');
            expect(await readHere('cspell.config.mjs')).toBe(codeConfig);
            expect(await readHere('cspell.config.yaml')).toBe(
                'language: en-GB\n' + 'import:\n' + '  - ./cspell.config.mjs\n',
            );
        });

        test('imports a code config in a subfolder', async () => {
            await writeHere('.config/cspell.config.ts', 'export default {};\n');
            await initHere('--schema');
            const content = await readHere('cspell.config.yaml');
            expect(content).toContain(yamlSchemaComment);
            expect(content).toContain('- ./.config/cspell.config.ts');
            expect(content).not.toContain('version');
        });
    });
});
