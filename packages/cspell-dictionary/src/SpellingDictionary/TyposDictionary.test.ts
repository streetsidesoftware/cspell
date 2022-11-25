import { createTyposDictionary } from './TyposDictionary';

// const oc = expect.objectContaining;

describe('TyposDictionary 1', () => {
    const dictWords = ['  english:English', 'grumpy', 'Avocado', 'avocadoS', '!avocado', 'crud'];
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
        ${''}        | ${undefined}             | ${undefined}
        ${'Avocado'} | ${{ ignoreCase: false }} | ${{ found: 'Avocado', forbidden: true, noSuggest: false }}
        ${'Avocado'} | ${{ ignoreCase: true }}  | ${{ found: 'avocado', forbidden: false, noSuggest: true }}
        ${'Avocado'} | ${undefined}             | ${{ found: 'avocado', forbidden: false, noSuggest: true }}
        ${'avocado'} | ${undefined}             | ${{ forbidden: false, found: 'avocado', noSuggest: true }}
        ${'English'} | ${{ ignoreCase: false }} | ${undefined}
        ${'english'} | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'english'} | ${{ ignoreCase: true }}  | ${undefined}
        ${'English'} | ${{ ignoreCase: true }}  | ${undefined}
        ${'Crud'}    | ${{ ignoreCase: true }}  | ${{ forbidden: true, found: 'crud', noSuggest: false }}
        ${'crude'}   | ${{ ignoreCase: true }}  | ${undefined}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${''}        | ${false}
        ${'avocado'} | ${true}
        ${'Avocado'} | ${true}
        ${'english'} | ${false}
        ${'English'} | ${false}
        ${'grumpy'}  | ${false}
    `('isNoSuggestWord of "$word"', async ({ word, expected }) => {
        expect(dict.isNoSuggestWord(word, {})).toEqual(expected);
    });

    test.each`
        word          | expected
        ${''}         | ${false}
        ${'avocado'}  | ${false}
        ${'Avocado'}  | ${true}
        ${'AvocadoS'} | ${false}
        ${'avocadoS'} | ${true}
        ${'crud'}     | ${true}
        ${'Crud'}     | ${true}
        ${'CRUD'}     | ${true}
        ${'english'}  | ${true}
        ${'English'}  | ${false}
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
        ${'English'}  | ${[{ word: 'English', cost: 1, isPreferred: true }]}
        ${'english'}  | ${[{ word: 'English', cost: 1, isPreferred: true }]}
        ${'avocadoS'} | ${[]}
        ${'AvocadoS'} | ${[]}
        ${'grumpy'}   | ${[]}
        ${'Grumpy'}   | ${[]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});

describe('TyposDictionary 2', () => {
    const dictWords = [
        '  english->English',
        'Grumpy',
        "wont:won't, will not",
        'avocado:Avocado',
        'timeout',
        'cafe->café',
        'notfound:NotFound',
        'found',
        'crud',
        'fudge',
        '!Fudge',
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
        ${'avocado'}    | ${{ ignoreCase: false }} | ${{ found: 'avocado', forbidden: true, noSuggest: false }}
        ${'Avocado'}    | ${{ ignoreCase: true }}  | ${undefined}
        ${'avocado'}    | ${undefined}             | ${undefined}
        ${'Avocado'}    | ${undefined}             | ${undefined}
        ${'Crud'}       | ${{}}                    | ${{ found: 'crud', forbidden: true, noSuggest: false }}
        ${'english'}    | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'English'}    | ${{ ignoreCase: false }} | ${undefined}
        ${'english'}    | ${{ ignoreCase: true }}  | ${undefined}
        ${'English'}    | ${{ ignoreCase: true }}  | ${undefined}
        ${'fudge'}      | ${{}}                    | ${{ found: 'fudge', forbidden: true, noSuggest: false }}
        ${'Fudge'}      | ${{}}                    | ${{ forbidden: false, found: 'Fudge', noSuggest: true }}
        ${'Grumpy'}     | ${{ ignoreCase: true }}  | ${{ found: 'Grumpy', forbidden: true, noSuggest: false }}
        ${'grumpy'}     | ${{ ignoreCase: true }}  | ${undefined}
        ${'notfound'}   | ${{ ignoreCase: false }} | ${{ found: 'notfound', forbidden: true, noSuggest: false }}
        ${'Notfound'}   | ${{ ignoreCase: false }} | ${{ found: 'notfound', forbidden: true, noSuggest: false }}
        ${'notfound'}   | ${{ ignoreCase: true }}  | ${undefined}
        ${'Notfound'}   | ${{ ignoreCase: true }}  | ${undefined}
        ${'notworking'} | ${undefined}             | ${{ forbidden: false, found: 'notworking', noSuggest: true }}
        ${'wont'}       | ${undefined}             | ${{ found: 'wont', forbidden: true, noSuggest: false }}
        ${'WONT'}       | ${undefined}             | ${{ found: 'wont', forbidden: true, noSuggest: false }}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word         | ignoreCase | expected
        ${''}        | ${false}   | ${false}
        ${''}        | ${true}    | ${false}
        ${'avocado'} | ${false}   | ${false}
        ${'Avocado'} | ${false}   | ${false}
        ${'avocado'} | ${true}    | ${false}
        ${'Avocado'} | ${true}    | ${false}
        ${'english'} | ${false}   | ${false}
        ${'English'} | ${false}   | ${false}
        ${'english'} | ${true}    | ${false}
        ${'English'} | ${true}    | ${false}
        ${'fudge'}   | ${false}   | ${false}
        ${'Fudge'}   | ${false}   | ${true}
        ${'fudge'}   | ${true}    | ${false}
        ${'Fudge'}   | ${true}    | ${true}
    `('isNoSuggestWord of "$word" ignoreCase: $ignoreCase', async ({ word, ignoreCase, expected }) => {
        expect(dict.isNoSuggestWord(word, { ignoreCase })).toEqual(expected);
    });

    test.each`
        word         | ignoreCase | expected
        ${''}        | ${false}   | ${false}
        ${''}        | ${true}    | ${false}
        ${'avocado'} | ${false}   | ${false}
        ${'Avocado'} | ${false}   | ${true}
        ${'avocado'} | ${true}    | ${true}
        ${'Avocado'} | ${true}    | ${true}
        ${'english'} | ${false}   | ${false}
        ${'English'} | ${false}   | ${true}
        ${'english'} | ${true}    | ${true}
        ${'English'} | ${true}    | ${true}
        ${'fudge'}   | ${false}   | ${false}
        ${'Fudge'}   | ${false}   | ${false}
        ${'fudge'}   | ${true}    | ${false}
        ${'Fudge'}   | ${true}    | ${false}
    `('isNoSuggestWord of "$word" ignoreCase: $ignoreCase', async ({ word, ignoreCase, expected }) => {
        expect(dict.isSuggestedWord(word, ignoreCase)).toEqual(expected);
    });

    test.each`
        word         | ignoreCase   | expected
        ${''}        | ${false}     | ${false}
        ${'Avocado'} | ${false}     | ${false}
        ${'avocado'} | ${false}     | ${true}
        ${'cafe'}    | ${false}     | ${true}
        ${'cafe'}    | ${true}      | ${false}
        ${'English'} | ${false}     | ${false}
        ${'english'} | ${false}     | ${true}
        ${'english'} | ${true}      | ${false}
        ${'english'} | ${undefined} | ${true}
        ${'grumpy'}  | ${false}     | ${false}
        ${'Grumpy'}  | ${false}     | ${true}
        ${'Grumpy'}  | ${true}      | ${true}
    `('isForbidden of "$word" IgnoreCase: $ignoreCase', async ({ word, ignoreCase, expected }) => {
        expect(dict.isForbidden(word, ignoreCase)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${''}        | ${[]}
        ${'Avocado'} | ${[{ cost: 1, isPreferred: true, word: 'Avocado' }]}
        ${'avocado'} | ${[{ cost: 1, isPreferred: true, word: 'Avocado' }]}
        ${'cafe'}    | ${[{ cost: 1, isPreferred: true, word: 'café' }]}
        ${'English'} | ${[{ word: 'English', isPreferred: true, cost: 1 }]}
        ${'english'} | ${[{ word: 'English', isPreferred: true, cost: 1 }]}
        ${'grumpy'}  | ${[]}
        ${'Grumpy'}  | ${[]}
        ${'wont'}    | ${[{ word: "won't", cost: 1 }, { word: 'will not', cost: 2 }]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});
