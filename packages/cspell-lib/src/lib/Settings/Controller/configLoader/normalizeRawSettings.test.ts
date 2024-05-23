import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { normalizeSettingsGlobs } from './normalizeRawSettings.js';

const pathToSettings = path.resolve('/path/to/settings.json');
const defaultSettingsUrl = pathToFileURL(pathToSettings);
const defaultSettingsPath = fileURLToPath(pathToSettings);

describe('normalize settings', () => {
    test.each`
        settings                                    | settingsUrl                              | expected
        ${{}}                                       | ${defaultSettingsUrl}                    | ${{}}
        ${{ files: [], ignorePaths: [], id: 'id' }} | ${defaultSettingsUrl}                    | ${{ files: [], ignorePaths: [] }}
        ${{ files: [], ignorePaths: undefined }}    | ${defaultSettingsUrl}                    | ${{ files: [] }}
        ${{ files: ['*.md'] }}                      | ${defaultSettingsUrl}                    | ${{ files: [{ glob: '*.md', source: defaultSettingsPath }] }}
        ${{ files: ['*.md'] }}                      | ${'vscode-vfs:///path/to/settings.json'} | ${{ files: [{ glob: '*.md', source: 'vscode-vfs:///path/to/settings.json' }] }}
        ${{ files: ['**/*.md'] }}                   | ${defaultSettingsUrl}                    | ${{ files: [{ glob: '**/*.md', source: defaultSettingsPath }] }}
        ${{ ignorePaths: ['**/*.md'] }}             | ${defaultSettingsUrl}                    | ${{ ignorePaths: [{ glob: '**/*.md', source: defaultSettingsPath }] }}
    `('normalizeSettingsGlobs $settings $settingsUrl', ({ settings, settingsUrl, expected }) => {
        expect(normalizeSettingsGlobs(settings, new URL(settingsUrl))).toEqual(expected);
    });
});
