import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { pathPackageFixtures } from '../../test-util/test.locations.js';
import { calcOverrideSettings } from './calcOverrideSettings.js';
import { readSettings } from './Controller/configLoader/index.js';
import type { CSpellSettingsWSTO } from './CSpellSettingsServer.js';
import { mergeSettings } from './CSpellSettingsServer.js';

const fixtures = path.join(pathPackageFixtures, 'override-globs-files-only');
const root = path.resolve('/project');

describe('calcOverrideSettings', () => {
    test.each`
        feature      | file           | expected
        ${undefined} | ${'src'}       | ${false}
        ${undefined} | ${'src/a.ts'}  | ${false}
        ${undefined} | ${'lib/a.ts'}  | ${undefined}
        ${false}     | ${'src'}       | ${false}
        ${false}     | ${'src/a.ts'}  | ${false}
        ${true}      | ${'src'}       | ${false}
        ${true}      | ${'src/a.ts'}  | ${undefined}
        ${true}      | ${'docs/a.md'} | ${false}
        ${true}      | ${'docs'}      | ${undefined}
    `('overrideGlobsMatchFilesOnly: $feature $file', ({ feature, file, expected }) => {
        const settings: CSpellSettingsWSTO = {
            features: feature === undefined ? undefined : { overrideGlobsMatchFilesOnly: feature },
            overrides: [
                { filename: { glob: '/src', root }, enabled: false },
                { filename: { glob: '/docs/', root }, enabled: false },
            ],
        };
        expect(calcOverrideSettings(settings, path.join(root, file)).enabled).toBe(expected);
    });

    test.each`
        feature  | file                | expected
        ${false} | ${'worktree/.git'}  | ${true}
        ${false} | ${'repo/.git/NOTE'} | ${true}
        ${false} | ${'repo/README.md'} | ${undefined}
        ${true}  | ${'worktree/.git'}  | ${false}
        ${true}  | ${'repo/.git/NOTE'} | ${true}
        ${true}  | ${'repo/README.md'} | ${undefined}
    `('issue 9590 overrideGlobsMatchFilesOnly: $feature $file', async ({ feature, file, expected }) => {
        const dir = path.join(fixtures, 'issue-9590');
        const config = await readSettings(path.join(dir, 'cspell.config.yaml'));
        const settings = mergeSettings(config, { features: { overrideGlobsMatchFilesOnly: feature } });
        expect(calcOverrideSettings(settings, path.join(dir, file)).enabled).toBe(expected);
    });

    test.each`
        config                 | file                    | expected
        ${'imports'}           | ${'src'}                | ${false}
        ${'imports'}           | ${'src/a.ts'}           | ${undefined}
        ${'imports'}           | ${'a/examples.ts'}      | ${false}
        ${'imports'}           | ${'a/examples.ts/b.ts'} | ${undefined}
        ${'feature-in-import'} | ${'src'}                | ${false}
        ${'feature-in-import'} | ${'src/a.ts'}           | ${undefined}
    `('imported configs $config $file', async ({ config, file, expected }) => {
        const dir = path.join(fixtures, config);
        const settings = await readSettings(path.join(dir, 'cspell.config.yaml'));
        expect(settings.features?.overrideGlobsMatchFilesOnly).toBe(true);
        expect(calcOverrideSettings(settings, path.join(dir, file)).enabled).toBe(expected);
    });
});
