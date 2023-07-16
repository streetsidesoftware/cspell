import { beforeEach, describe, expect, test } from 'vitest';

import { build } from './build.js';
import { setLogger } from './compiler/index.js';
import { readTextFile } from './compiler/readers/readTextFile.js';
import { spyOnConsole } from './test/console.js';
import { createTestHelper } from './test/TestHelper.js';

const helper = createTestHelper(import.meta.url);

const consoleSpy = spyOnConsole();
setLogger(console.log);

describe('build action', () => {
    beforeEach(() => {
        helper.beginTest();
        helper.clearTempDir();
        consoleSpy.attach();
        setLogger(console.log);
    });

    test.each`
        sourceRoot                       | config                                                    | target
        ${f('build-single-target-json')} | ${undefined}                                              | ${tBuilds('build-single-target-json/colors.txt')}
        ${'.'}                           | ${f('build-single-target-yaml/cspell-tools.config.yaml')} | ${'my/colors.txt'}
        ${f('build-single-trie')}        | ${undefined}                                              | ${tBuilds('build-single-trie/cities.trie')}
        ${f('build-source-list')}        | ${undefined}                                              | ${tBuilds('build-source-list/source-list.txt')}
        ${'.'}                           | ${f('build-combo/cspell-tools.config.yaml')}              | ${'color-cities-code.txt'}
    `('build %#', async ({ sourceRoot, config, target }) => {
        await expect(build(undefined, { config, root: t(sourceRoot), cwd: t() })).resolves.toBeUndefined();
        const content = await readTextFile(t(target));
        expect(content).toMatchSnapshot();
    });

    test.each`
        targets       | config                           | builds
        ${undefined}  | ${cfgYaml('build-multi-target')} | ${['colors.txt', 'code.txt', 'cities.txt']}
        ${['colors']} | ${cfgYaml('build-multi-target')} | ${['colors.txt', '!code.txt', '!cities.txt']}
    `(
        'build multi %#',
        async ({ targets, config, builds }: { targets: string[] | undefined; config: string; builds: string[] }) => {
            await expect(build(targets, { config, cwd: t() })).resolves.toBeUndefined();
            const shouldExist = builds.filter((a) => !a.startsWith('!'));
            const shouldNotExist = builds.filter((a) => a.startsWith('!')).map((a) => a.slice(1));
            for (const build of shouldExist) {
                const content = await readTextFile(t(build));
                expect(content).toMatchSnapshot();
            }
            for (const build of shouldNotExist) {
                const found = await helper.fileExists(t(build));
                expect(found && build).toBe(false);
            }
        },
    );
});

function tBuilds(...parts: string[]): string {
    return helper.packageTemp('builds', ...parts);
}

function t(...parts: string[]): string {
    return helper.resolveTemp(...parts);
}

function f(...parts: string[]): string {
    return helper.resolveFixture(...parts);
}

function cfgYaml(...parts: string[]): string {
    return helper.resolveFixture(...parts, 'cspell-tools.config.yaml');
}
