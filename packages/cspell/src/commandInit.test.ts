import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { Command } from 'commander';
import { cspellConfigFileSchema } from 'cspell-config-lib';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { run } from './app.mjs';

const oldSchema = 'https://example.com/old.schema.json';
const yamlSchemaComment = `# yaml-language-server: $schema=${cspellConfigFileSchema}`;

describe('cspell init $schema', () => {
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
});
