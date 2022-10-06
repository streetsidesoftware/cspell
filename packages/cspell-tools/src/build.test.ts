import { build } from './build';
import { readTextFile } from './compiler/readTextFile';
import { createTestHelper } from './test/TestHelper';

const helper = createTestHelper(__filename);

describe('build action', () => {
    beforeEach(() => {
        helper.beginTest();
        helper.clearTempDir();
    });

    test.each`
        currentDir                       | config                                                    | target
        ${f('build-single-target-json')} | ${undefined}                                              | ${tBuild('build-single-target-json/colors.txt')}
        ${'.'}                           | ${f('build-single-target-yaml/cspell-tools.config.yaml')} | ${'my/colors.txt'}
        ${f('build-single-trie')}        | ${undefined}                                              | ${tBuild('build-single-trie/cities.trie')}
        ${f('build-source-list')}        | ${undefined}                                              | ${tBuild('build-source-list/source-list.txt')}
    `('build', async ({ currentDir, config, target }) => {
        helper.mkdir(currentDir);
        helper.cd(currentDir);
        await expect(build(undefined, { config })).resolves.toBeUndefined();
        const content = await readTextFile(target);
        expect(content).toMatchSnapshot();
    });

    test.each`
        targets       | config                           | builds
        ${undefined}  | ${cfgYaml('build-multi-target')} | ${['colors.txt', 'code.txt', 'cities.txt']}
        ${['colors']} | ${cfgYaml('build-multi-target')} | ${['colors.txt', '!code.txt', '!cities.txt']}
    `(
        'build multi',
        async ({ targets, config, builds }: { targets: string[] | undefined; config: string; builds: string[] }) => {
            helper.cdToTempDir();
            await expect(build(targets, { config })).resolves.toBeUndefined();
            const shouldExist = builds.filter((a) => !a.startsWith('!'));
            const shouldNotExist = builds.filter((a) => a.startsWith('!')).map((a) => a.slice(1));
            for (const build of shouldExist) {
                const content = await readTextFile(build);
                expect(content).toMatchSnapshot();
            }
            for (const build of shouldNotExist) {
                const found = await helper.fileExists(build);
                expect(found && build).toBe(false);
            }
        }
    );
});

/**
 * resolve build target
 * @param parts
 * @returns
 */
function tBuild(...parts: string[]): string {
    return t('builds', ...parts);
}

function t(...parts: string[]): string {
    return helper.packageTemp(...parts);
}

function f(...parts: string[]): string {
    return helper.resolveFixture(...parts);
}

function cfgYaml(...parts: string[]): string {
    return helper.resolveFixture(...parts, 'cspell-tools.config.yaml');
}
