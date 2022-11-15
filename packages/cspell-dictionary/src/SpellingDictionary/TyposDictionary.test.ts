import { createTyposDictionary } from './TyposDictionary';

// const oc = expect.objectContaining;

describe('ForbiddenWordsDictionary', () => {
    const dictWords = ['  english:English', 'grumpy', 'Avocado', 'avocadoS', '!avocado'];
    const dict = createTyposDictionary(dictWords, 'typos', 'test');

    test.each`
        word         | expected
        ${'avocado'} | ${false}
        ${'Avocado'} | ${false}
        ${'grumpy'}  | ${false}
        ${'Grumpy'}  | ${false}
        ${''}        | ${false}
        ${'English'} | ${false}
        ${'english'} | ${false}
    `('has of "$word"', async ({ word, expected }) => {
        expect(dict.has(word)).toEqual(expected);
    });

    test.each`
        word         | options                  | expected
        ${'avocado'} | ${undefined}             | ${undefined}
        ${'Avocado'} | ${undefined}             | ${{ found: 'Avocado', forbidden: true, noSuggest: false }}
        ${'Avocado'} | ${{ ignoreCase: true }}  | ${{ found: 'Avocado', forbidden: true, noSuggest: false }}
        ${''}        | ${undefined}             | ${undefined}
        ${'English'} | ${{ ignoreCase: true }}  | ${undefined}
        ${'English'} | ${{ ignoreCase: false }} | ${undefined}
        ${'english'} | ${{ ignoreCase: true }}  | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'english'} | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${'avocado'} | ${false}
        ${'Avocado'} | ${false}
        ${''}        | ${false}
        ${'English'} | ${false}
        ${'english'} | ${false}
    `('isNoSuggestWord of "$word"', async ({ word, expected }) => {
        expect(dict.isNoSuggestWord(word, {})).toEqual(expected);
    });

    test.each`
        word          | expected
        ${'avocado'}  | ${false}
        ${'Avocado'}  | ${true}
        ${''}         | ${false}
        ${'English'}  | ${false}
        ${'english'}  | ${true}
        ${'avocadoS'} | ${true}
        ${'AvocadoS'} | ${false}
        ${'grumpy'}   | ${true}
        ${'Grumpy'}   | ${true}
    `('isForbidden of "$word"', async ({ word, expected }) => {
        expect(dict.isForbidden(word)).toEqual(expected);
    });

    test.each`
        word          | expected
        ${'avocado'}  | ${[]}
        ${'Avocado'}  | ${[]}
        ${''}         | ${[]}
        ${'English'}  | ${[]}
        ${'english'}  | ${[{ word: 'English', cost: 1, isPreferred: true }]}
        ${'avocadoS'} | ${[]}
        ${'AvocadoS'} | ${[]}
        ${'grumpy'}   | ${[]}
        ${'Grumpy'}   | ${[]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});

describe('ForbiddenWordsDictionaryTrie', () => {
    const dictWords = [
        '  english->English',
        'Grumpy',
        "wont:won't, will not",
        'avocado:Avocado',
        'timeout',
        'notfound:NotFound',
        'found',
        '!notworking',
    ];
    const dict = createTyposDictionary(dictWords, 'typos', 'test');

    test.each`
        word         | expected
        ${'avocado'} | ${false}
        ${'Avocado'} | ${false}
        ${'grumpy'}  | ${false}
        ${'Grumpy'}  | ${false}
        ${''}        | ${false}
        ${'English'} | ${false}
        ${'english'} | ${false}
    `('has of "$word"', async ({ word, expected }) => {
        expect(dict.has(word)).toEqual(expected);
    });

    // cspell:ignore notworking

    test.each`
        word            | options                  | expected
        ${''}           | ${undefined}             | ${undefined}
        ${'avocado'}    | ${{ ignoreCase: true }}  | ${{ found: 'avocado', forbidden: true, noSuggest: false }}
        ${'Avocado'}    | ${{ ignoreCase: true }}  | ${undefined}
        ${'avocado'}    | ${undefined}             | ${{ found: 'avocado', forbidden: true, noSuggest: false }}
        ${'Avocado'}    | ${undefined}             | ${undefined}
        ${'english'}    | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'English'}    | ${{ ignoreCase: false }} | ${undefined}
        ${'english'}    | ${{ ignoreCase: true }}  | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'English'}    | ${{ ignoreCase: true }}  | ${undefined}
        ${'Grumpy'}     | ${{ ignoreCase: true }}  | ${{ found: 'Grumpy', forbidden: true, noSuggest: false }}
        ${'grumpy'}     | ${{ ignoreCase: true }}  | ${undefined}
        ${'notfound'}   | ${{ ignoreCase: true }}  | ${{ found: 'notfound', forbidden: true, noSuggest: false }}
        ${'Notfound'}   | ${{}}                    | ${{ found: 'notfound', forbidden: true, noSuggest: false }}
        ${'notworking'} | ${undefined}             | ${undefined}
        ${'wont'}       | ${undefined}             | ${{ found: 'wont', forbidden: true, noSuggest: false }}
        ${'WONT'}       | ${undefined}             | ${{ found: 'wont', forbidden: true, noSuggest: false }}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${'avocado'} | ${false}
        ${'Avocado'} | ${false}
        ${''}        | ${false}
        ${'English'} | ${false}
        ${'english'} | ${false}
    `('isNoSuggestWord of "$word"', async ({ word, expected }) => {
        expect(dict.isNoSuggestWord(word, {})).toEqual(expected);
    });

    test.each`
        word         | expected
        ${'avocado'} | ${true}
        ${'Avocado'} | ${false}
        ${''}        | ${false}
        ${'English'} | ${false}
        ${'english'} | ${true}
        ${'grumpy'}  | ${false}
        ${'Grumpy'}  | ${true}
    `('isForbidden of "$word"', async ({ word, expected }) => {
        expect(dict.isForbidden(word)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${''}        | ${[]}
        ${'Avocado'} | ${[]}
        ${'avocado'} | ${[{ cost: 1, isPreferred: true, word: 'Avocado' }]}
        ${'English'} | ${[]}
        ${'english'} | ${[{ word: 'English', isPreferred: true, cost: 1 }]}
        ${'grumpy'}  | ${[]}
        ${'Grumpy'}  | ${[]}
        ${'wont'}    | ${[{ word: "won't", cost: 1 }, { word: 'will not', cost: 2 }]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});
