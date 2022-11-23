import { createForbiddenWordsDictionary } from './ForbiddenWordsDictionary';

// const oc = expect.objectContaining;

describe('ForbiddenWordsDictionary', () => {
    const dictWords = ['  english', '!English', 'grumpy', 'Avocado', 'avocadoS', '!avocado'];
    const dict = createForbiddenWordsDictionary(dictWords, 'flag_words', 'test');

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
        ${'avocado'} | ${undefined}             | ${{ forbidden: false, found: 'avocado', noSuggest: true }}
        ${'Avocado'} | ${undefined}             | ${{ found: 'avocado', forbidden: false, noSuggest: true }}
        ${'Avocado'} | ${{ ignoreCase: true }}  | ${{ found: 'avocado', forbidden: false, noSuggest: true }}
        ${'Avocado'} | ${{ ignoreCase: false }} | ${{ found: 'Avocado', forbidden: true, noSuggest: false }}
        ${''}        | ${undefined}             | ${undefined}
        ${'English'} | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'English', noSuggest: true }}
        ${'English'} | ${{ ignoreCase: false }} | ${{ forbidden: false, found: 'English', noSuggest: true }}
        ${'english'} | ${{ ignoreCase: true }}  | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'english'} | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word         | ignoreCase | expected
        ${''}        | ${false}   | ${false}
        ${''}        | ${true}    | ${false}
        ${'Avocado'} | ${false}   | ${false}
        ${'avocado'} | ${false}   | ${true}
        ${'Avocado'} | ${true}    | ${true}
        ${'avocado'} | ${true}    | ${true}
        ${'english'} | ${false}   | ${false}
        ${'English'} | ${false}   | ${true}
        ${'english'} | ${true}    | ${false}
        ${'English'} | ${true}    | ${true}
    `('isNoSuggestWord of "$word" ignoreCase: $ignoreCase', async ({ word, ignoreCase, expected }) => {
        const result = dict.isNoSuggestWord(word, { ignoreCase });
        expect(result).toEqual(expected);
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
        const result = dict.isForbidden(word);
        expect(result).toEqual(expected);
    });

    test.each`
        word          | expected
        ${'avocado'}  | ${[]}
        ${'Avocado'}  | ${[]}
        ${''}         | ${[]}
        ${'English'}  | ${[]}
        ${'english'}  | ${[]}
        ${'avocadoS'} | ${[]}
        ${'AvocadoS'} | ${[]}
        ${'grumpy'}   | ${[]}
        ${'Grumpy'}   | ${[]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});

describe('ForbiddenWordsDictionaryTrie', () => {
    const flagWords = [
        '  english',
        '!English',
        'grumpy',
        'Avocado',
        'Capitol',
        'avocadoS',
        '!avocado',
        'not+',
        '+found',
        '+working',
        '!notfound',
    ];
    const dict = createForbiddenWordsDictionary(flagWords, 'flag_words', 'test');

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
        ${'avocado'}    | ${undefined}             | ${{ forbidden: false, found: 'avocado', noSuggest: true }}
        ${'Avocado'}    | ${undefined}             | ${{ found: 'avocado', forbidden: false, noSuggest: true }}
        ${'Avocado'}    | ${{ ignoreCase: true }}  | ${{ found: 'avocado', forbidden: false, noSuggest: true }}
        ${'Avocado'}    | ${{ ignoreCase: false }} | ${{ found: 'Avocado', forbidden: true, noSuggest: false }}
        ${'avocado'}    | ${{ ignoreCase: false }} | ${{ forbidden: false, found: 'avocado', noSuggest: true }}
        ${'avocado'}    | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'avocado', noSuggest: true }}
        ${''}           | ${undefined}             | ${undefined}
        ${'English'}    | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'English', noSuggest: true }}
        ${'English'}    | ${{ ignoreCase: false }} | ${{ forbidden: false, found: 'English', noSuggest: true }}
        ${'english'}    | ${{ ignoreCase: true }}  | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'english'}    | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'Grumpy'}     | ${{ ignoreCase: true }}  | ${{ found: 'grumpy', forbidden: true, noSuggest: false }}
        ${'notfound'}   | ${{ ignoreCase: false }} | ${{ forbidden: false, found: 'notfound', noSuggest: true }}
        ${'notfound'}   | ${{ ignoreCase: true }}  | ${{ forbidden: false, found: 'notfound', noSuggest: true }}
        ${'notfound'}   | ${{}}                    | ${{ forbidden: false, found: 'notfound', noSuggest: true }}
        ${'notworking'} | ${undefined}             | ${undefined}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word         | ignoreCase | expected
        ${''}        | ${false}   | ${false}
        ${''}        | ${true}    | ${false}
        ${'Avocado'} | ${false}   | ${false}
        ${'avocado'} | ${false}   | ${true}
        ${'Avocado'} | ${true}    | ${true}
        ${'avocado'} | ${true}    | ${true}
        ${'english'} | ${false}   | ${false}
        ${'English'} | ${false}   | ${true}
        ${'english'} | ${true}    | ${false}
        ${'English'} | ${true}    | ${true}
    `('isNoSuggestWord of "$word" IgnoreCase: $ignoreCase', async ({ word, ignoreCase, expected }) => {
        const result = dict.isNoSuggestWord(word, { ignoreCase });
        expect(result).toEqual(expected);
    });

    test.each`
        word          | expected
        ${''}         | ${false}
        ${'avocado'}  | ${false}
        ${'Avocado'}  | ${true}
        ${'AvocadoS'} | ${false}
        ${'avocadoS'} | ${true}
        ${'capitol'}  | ${false}
        ${'Capitol'}  | ${true}
        ${'English'}  | ${false}
        ${'english'}  | ${true}
        ${'grumpy'}   | ${true}
        ${'Grumpy'}   | ${true}
        ${'GRUMPY'}   | ${true}
    `('isForbidden of "$word"', async ({ word, expected }) => {
        const result = dict.isForbidden(word);
        expect(result).toEqual(expected);
    });

    test.each`
        word          | expected
        ${'avocado'}  | ${[]}
        ${'Avocado'}  | ${[]}
        ${''}         | ${[]}
        ${'English'}  | ${[]}
        ${'english'}  | ${[]}
        ${'avocadoS'} | ${[]}
        ${'AvocadoS'} | ${[]}
        ${'grumpy'}   | ${[]}
        ${'Grumpy'}   | ${[]}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.suggest(word)).toEqual(expected);
    });
});
