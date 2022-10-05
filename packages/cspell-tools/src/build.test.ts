import { build } from './build';
import { readTextFile } from './compiler/readTextFile';
import { createTestHelper } from './test/TestHelper';

const helper = createTestHelper(__filename);

describe('build action', () => {
    test.each`
        currentDir                       | config                                                    | target
        ${f('build-single-target-json')} | ${undefined}                                              | ${t('build-single-target-json/colors.txt')}
        ${'.'}                           | ${f('build-single-target-yaml/cspell-tools.config.yaml')} | ${t('build-single-target-yaml/colors.txt')}
        ${f('build-single-trie')}        | ${undefined}                                              | ${t('build-single-trie/cities.trie')}
        ${f('build-source-list')}        | ${undefined}                                              | ${t('build-source-list/source-list.txt')}
    `('build', async ({ currentDir, config, target }) => {
        helper.mkdir(currentDir);
        helper.cd(currentDir);
        await expect(build(undefined, { config })).resolves.toBeUndefined();
        const content = await readTextFile(target);
        expect(content).toMatchSnapshot();
    });
});

/**
 * resolve build target
 * @param parts
 * @returns
 */
function t(...parts: string[]): string {
    return helper.packageTemp('builds', ...parts);
}

function f(...parts: string[]): string {
    return helper.resolveFixture(...parts);
}
