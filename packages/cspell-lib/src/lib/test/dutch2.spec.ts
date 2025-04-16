import { describe, expect, test } from 'vitest';

import * as cspell from '../index.js';

const timeout = 10_000;

describe('Validate ignoreForbiddenWords', () => {
    const dutchSampleUrl = new URL('../../../samples/ignore-forbidden-dutch-words/', import.meta.url);
    const dutchSampleReadme = new URL('README.md', dutchSampleUrl);

    test('samples/ignore-forbidden-dutch-words/README.md', { timeout }, async () => {
        const configFile = await cspell.readConfigFile(new URL('cspell.config.mjs', dutchSampleUrl));
        const result = await cspell.spellCheckDocument({ uri: dutchSampleReadme.href }, {}, configFile);
        expect(result).toBeDefined();
        expect(result.issues).toHaveLength(0);
    });
});
