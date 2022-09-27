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
    const dictWords = [
        '  english',
        '!English',
        'grumpy',
        'Avocado',
        'avocadoS',
        '!avocado',
        'not+',
        '+found',
        '+working',
        '!notfound',
    ];
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

    // cspell:ignore notworking

    test.each`
        word            | options                  | expected
        ${'avocado'}    | ${undefined}             | ${undefined}
        ${'Avocado'}    | ${undefined}             | ${{ found: 'avocado', forbidden: true, noSuggest: false }}
        ${'Avocado'}    | ${{ ignoreCase: true }}  | ${{ found: 'avocado', forbidden: true, noSuggest: false }}
        ${'avocado'}    | ${{ ignoreCase: true }}  | ${undefined}
        ${''}           | ${undefined}             | ${undefined}
        ${'English'}    | ${{ ignoreCase: true }}  | ${undefined}
        ${'English'}    | ${{ ignoreCase: false }} | ${undefined}
        ${'english'}    | ${{ ignoreCase: true }}  | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'english'}    | ${{ ignoreCase: false }} | ${{ found: 'english', forbidden: true, noSuggest: false }}
        ${'Grumpy'}     | ${{ ignoreCase: true }}  | ${undefined}
        ${'notfound'}   | ${{ ignoreCase: true }}  | ${undefined}
        ${'notfound'}   | ${{}}                    | ${undefined}
        ${'notworking'} | ${undefined}             | ${undefined}
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
        ${'Grumpy'}   | ${false}
    `('isForbidden of "$word"', async ({ word, expected }) => {
        expect(dict.isForbidden(word)).toEqual(expected);
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
