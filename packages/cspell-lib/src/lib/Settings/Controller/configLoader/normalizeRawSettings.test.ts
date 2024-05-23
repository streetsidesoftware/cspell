import { describe, expect, test } from 'vitest';

import { normalizeSettingsGlobs } from './normalizeRawSettings.js';

describe('normalize settings', () => {
    test.each`
        settings                                    | settingsUrl                              | expected
        ${{}}                                       | ${'file:///path/to/settings.json'}       | ${{}}
        ${{ files: [], ignorePaths: [], id: 'id' }} | ${'file:///path/to/settings.json'}       | ${{ files: [], ignorePaths: [] }}
        ${{ files: [], ignorePaths: undefined }}    | ${'file:///path/to/settings.json'}       | ${{ files: [] }}
        ${{ files: ['*.md'] }}                      | ${'file:///path/to/settings.json'}       | ${{ files: [{ glob: '*.md', source: '/path/to/settings.json' }] }}
        ${{ files: ['*.md'] }}                      | ${'vscode-vfs:///path/to/settings.json'} | ${{ files: [{ glob: '*.md', source: 'vscode-vfs:///path/to/settings.json' }] }}
        ${{ files: ['**/*.md'] }}                   | ${'file:///path/to/settings.json'}       | ${{ files: [{ glob: '**/*.md', source: '/path/to/settings.json' }] }}
        ${{ ignorePaths: ['**/*.md'] }}             | ${'file:///path/to/settings.json'}       | ${{ ignorePaths: [{ glob: '**/*.md', source: '/path/to/settings.json' }] }}
    `('normalizeSettingsGlobs $settings $settingsUrl', ({ settings, settingsUrl, expected }) => {
        expect(normalizeSettingsGlobs(settings, new URL(settingsUrl))).toEqual(expected);
    });
});
