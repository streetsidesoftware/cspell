import { build } from './build';
import { createTestHelper } from './test/TestHelper';

const helper = createTestHelper(__filename);

describe('build action', () => {
    test.each`
        currentDir                                           | config
        ${helper.resolveFixture('build-single-target-json')} | ${undefined}
        ${'.'}                                               | ${helper.resolveFixture('build-single-target-yaml/cspell-tools.config.yaml')}
    `('build', async ({ currentDir, config }) => {
        helper.mkdir(currentDir);
        helper.cd(currentDir);
        await expect(build(undefined, { config })).resolves.toBeUndefined();
    });
});
