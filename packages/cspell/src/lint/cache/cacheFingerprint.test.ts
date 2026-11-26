import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { calcCacheFingerprint } from './cacheFingerprint.js';

describe('calcCacheFingerprint', () => {
    test.each`
        options                                                 | expected
        ${{}}                                                   | ${undefined}
        ${{ languageId: '', locale: '' }}                       | ${undefined}
        ${{ languageId: 'markdown' }}                           | ${'{"languageId":"markdown"}'}
        ${{ locale: 'fr' }}                                     | ${'{"locale":"fr"}'}
        ${{ report: 'flagged' }}                                | ${'{"report":"flagged"}'}
        ${{ showSuggestions: false }}                           | ${'{"showSuggestions":false}'}
        ${{ validateDirectives: true }}                         | ${'{"validateDirectives":true}'}
        ${{ validateDirectives: true, languageId: 'markdown' }} | ${'{"languageId":"markdown","validateDirectives":true}'}
        ${{ stopConfigSearchAt: [] }}                           | ${undefined}
        ${{ stopConfigSearchAt: stops('.') }}                   | ${'{"stopConfigSearchAt":["."]}'}
        ${{ stopConfigSearchAt: stops('src', '..') }}           | ${'{"stopConfigSearchAt":["..","src"]}'}
        ${{ stopConfigSearchAt: stops('src/a/b') }}             | ${'{"stopConfigSearchAt":["src/a/b"]}'}
        ${{ configSearch: true }}                               | ${undefined}
        ${{ configSearch: false }}                              | ${'{"configSearch":false}'}
    `('calcCacheFingerprint $options', ({ options, expected }) => {
        expect(calcCacheFingerprint(options, process.cwd())).toBe(expected);
    });

    test.each`
        config                        | expected
        ${'cspell.custom.json'}       | ${'{"config":"cspell.custom.json"}'}
        ${'packages/foo/cspell.json'} | ${'{"config":"packages/foo/cspell.json"}'}
        ${'../cspell.json'}           | ${'{"config":"../cspell.json"}'}
    `('names the config relative to the root: $config', ({ config, expected }) => {
        const root = process.cwd();
        const configUrl = pathToFileURL(path.resolve(root, config));
        expect(calcCacheFingerprint({ configUrl }, root)).toBe(expected);
    });

    test('keeps the URL of a config that is not a file', () => {
        const configUrl = new URL('https://example.com/cspell.json');
        expect(calcCacheFingerprint({ configUrl }, process.cwd())).toBe('{"config":"https://example.com/cspell.json"}');
    });
});

function stops(...folders: string[]): URL[] {
    return folders.map((folder) => pathToFileURL(path.resolve(folder) + path.sep));
}
