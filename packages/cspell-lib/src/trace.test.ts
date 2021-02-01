import { traceWords, getDefaultSettings } from '.';
import { CSpellSettings } from '@cspell/cspell-types';

describe('Verify trace', () => {
    jest.setTimeout(10000);
    test('tests tracing a word', async () => {
        const words = ['apple'];
        const config = getDefaultSettings();
        const results = await traceWords(words, config);
        expect(Object.keys(results)).not.toHaveLength(0);
        const foundIn = results.filter((r) => r.found);
        expect(foundIn).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    dictName: 'en_us',
                    dictSource: expect.stringContaining('en_US.trie.gz'),
                }),
            ])
        );
    });

    test('tracing with missing dictionary.', async () => {
        const words = ['apple'];
        const defaultConfig = getDefaultSettings();
        const dictionaryDefinitions = (defaultConfig.dictionaryDefinitions || []).concat([
            {
                name: 'bad dict',
                path: './missing.txt',
            },
        ]);
        const config: CSpellSettings = {
            ...defaultConfig,
            dictionaryDefinitions,
        };
        const results = await traceWords(words, config);
        expect(Object.keys(results)).not.toHaveLength(0);
        const foundIn = results.filter((r) => r.found);
        expect(foundIn).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    dictName: 'en_us',
                    dictSource: expect.stringContaining('en_US.trie.gz'),
                }),
            ])
        );

        const resultsWithErrors = results.filter((r) => !!r.errors);
        expect(resultsWithErrors).toHaveLength(1);

        expect(resultsWithErrors).toContainEqual(
            expect.objectContaining({
                dictName: 'bad dict',
                dictSource: 'missing.txt',
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.stringContaining('failed to load'),
                    }),
                ]),
            })
        );
    });
});
