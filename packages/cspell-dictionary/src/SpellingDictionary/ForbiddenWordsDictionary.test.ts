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

    test.each`
        word          | expected
        ${'avocado'}  | ${'avocado'}
        ${'Avocado'}  | ${'Avocado'}
        ${''}         | ${''}
        ${'English'}  | ${'English'}
        ${'english'}  | ${'english'}
        ${'avocadoS'} | ${'avocadoS'}
        ${'AvocadoS'} | ${'AvocadoS'}
        ${'grumpy'}   | ${'grumpy'}
        ${'Grumpy'}   | ${'Grumpy'}
    `('suggest of "$word"', async ({ word, expected }) => {
        expect(dict.mapWord(word)).toEqual(expected);
    });
});
