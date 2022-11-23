import { createTyposDictionary, _createTyposDictionary } from './TyposDictionary';

// const oc = expect.objectContaining;

describe('ForbiddenWordsDictionary', () => {
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
        ${'English'} | ${{ ignoreCase: false }} | ${{ forbidden: false, found: 'English', noSuggest: true }}
        ${'english'} | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'english'} | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'english', noSuggest: true }}
        ${'English'} | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'English', noSuggest: true }}
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
        ${'english'} | ${true}
        ${'English'} | ${true}
        ${'grumpy'}  | ${false}
    `('isNoSuggestWord of "$word"', async ({ word, expected }) => {
        expect(dict.isNoSuggestWord(word, {})).toEqual(expected);
    });

    test.each`
        word          | expected
        ${''}         | ${false}
        ${'avocado'}  | ${false}
        ${'Avocado'}  | ${false}
        ${'AvocadoS'} | ${false}
        ${'avocadoS'} | ${true}
        ${'crud'}     | ${true}
        ${'Crud'}     | ${true}
        ${'CRUD'}     | ${true}
        ${'english'}  | ${false}
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
        'cafe->café',
        'notfound:NotFound',
        'found',
        'crud',
        'fudge',
        '!Fudge',
        '!notworking',
    ];
    const dict = _createTyposDictionary(dictWords, 'typos', 'test');

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
        ${'Avocado'}    | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'Avocado', noSuggest: true }}
        ${'avocado'}    | ${undefined}             | ${{ forbidden: false, found: 'avocado', noSuggest: true }}
        ${'Avocado'}    | ${undefined}             | ${{ forbidden: false, found: 'Avocado', noSuggest: true }}
        ${'Crud'}       | ${{}}                    | ${{ found: 'crud', forbidden: true, noSuggest: false }}
        ${'english'}    | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'English'}    | ${{ ignoreCase: false }} | ${{ found: 'English', forbidden: false, noSuggest: true }}
        ${'english'}    | ${{ ignoreCase: true }}  | ${{ found: 'english', forbidden: false, noSuggest: true }}
        ${'English'}    | ${{ ignoreCase: true }}  | ${{ found: 'English', forbidden: false, noSuggest: true }}
        ${'fudge'}      | ${{}}                    | ${{ found: 'fudge', forbidden: true, noSuggest: false }}
        ${'Fudge'}      | ${{}}                    | ${{ forbidden: false, found: 'Fudge', noSuggest: true }}
        ${'Grumpy'}     | ${{ ignoreCase: true }}  | ${{ found: 'Grumpy', forbidden: true, noSuggest: false }}
        ${'grumpy'}     | ${{ ignoreCase: true }}  | ${undefined}
        ${'notfound'}   | ${{ ignoreCase: false }} | ${{ found: 'notfound', forbidden: true, noSuggest: false }}
        ${'Notfound'}   | ${{ ignoreCase: false }} | ${{ found: 'notfound', forbidden: true, noSuggest: false }}
        ${'notfound'}   | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'notfound', noSuggest: true }}
        ${'Notfound'}   | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'notfound', noSuggest: true }}
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
        ${'Avocado'} | ${false}   | ${true}
        ${'avocado'} | ${true}    | ${false}
        ${'Avocado'} | ${true}    | ${true}
        ${'english'} | ${false}   | ${false}
        ${'English'} | ${false}   | ${true}
        ${'english'} | ${true}    | ${false}
        ${'English'} | ${true}    | ${true}
    `('isNoSuggestWord of "$word" ignoreCase: $ignoreCase', async ({ word, expected }) => {
        expect(dict.isNoSuggestWord(word, { ignoreCase: false })).toEqual(expected);
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
        ${'english'} | ${undefined} | ${false}
        ${'grumpy'}  | ${false}     | ${false}
        ${'Grumpy'}  | ${false}     | ${true}
        ${'Grumpy'}  | ${true}      | ${true}
    `('isForbidden of "$word" IgnoreCase: $ignoreCase', async ({ word, ignoreCase, expected }) => {
        expect(dict.isForbidden(word, ignoreCase)).toEqual(expected);
    });

    test.each`
        word         | expected
        ${''}        | ${[]}
        ${'Avocado'} | ${[]}
        ${'avocado'} | ${[{ cost: 1, isPreferred: true, word: 'Avocado' }]}
        ${'cafe'}    | ${[{ cost: 1, isPreferred: true, word: 'café' }]}
        ${'English'} | ${[]}
        ${'english'} | ${[{ word: 'English', isPreferred: true, cost: 1 }]}
        ${'grumpy'}  | ${[]}
        ${'Grumpy'}  | ${[]}
        ${'wont'}    | ${[{ word: "won't", cost: 1 }, { word: 'will not', cost: 2 }]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});
