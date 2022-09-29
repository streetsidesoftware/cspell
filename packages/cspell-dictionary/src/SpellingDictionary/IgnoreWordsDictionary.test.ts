import { createIgnoreWordsDictionary } from './IgnoreWordsDictionary';

// const oc = expect.objectContaining;

// cspell:ignore êphone îphone geschäft

describe('IgnoreWordsDictionary', () => {
    const dictWords = ['  English', 'grumpy', 'Avocado', 'avocados', 'Café', ' êphone', 'îphone', 'geschäft'];
    const dict = createIgnoreWordsDictionary(dictWords, 'ignore words', 'test');

    test.each`
        word         | expected
        ${''}        | ${false}
        ${'avocado'} | ${true}
        ${'Avocado'} | ${true}
        ${'english'} | ${true}
        ${'English'} | ${true}
        ${'grumpy'}  | ${true}
        ${'Grumpy'}  | ${true}
    `('has of "$word"', async ({ word, expected }) => {
        expect(dict.has(word)).toEqual(expected);
    });

    test.each`
        word                         | options                  | expected
        ${'avocado'}                 | ${undefined}             | ${{ found: 'avocado', forbidden: false, noSuggest: true }}
        ${'Avocado'}                 | ${undefined}             | ${{ found: 'Avocado', forbidden: false, noSuggest: true }}
        ${'Avocado'}                 | ${{ ignoreCase: true }}  | ${{ found: 'Avocado', forbidden: false, noSuggest: true }}
        ${''}                        | ${undefined}             | ${undefined}
        ${'English'}                 | ${{ ignoreCase: true }}  | ${{ found: 'English', forbidden: false, noSuggest: true }}
        ${'English'}                 | ${{ ignoreCase: false }} | ${{ found: 'English', forbidden: false, noSuggest: true }}
        ${'english'}                 | ${{ ignoreCase: true }}  | ${{ found: 'english', forbidden: false, noSuggest: true }}
        ${'english'}                 | ${{ ignoreCase: false }} | ${undefined}
        ${'îphone'.normalize('NFC')} | ${undefined}             | ${{ found: 'îphone'.normalize('NFC'), forbidden: false, noSuggest: true }}
        ${'îphone'.normalize('NFD')} | ${undefined}             | ${{ found: 'îphone'.normalize('NFC'), forbidden: false, noSuggest: true }}
        ${'iphone'}                  | ${undefined}             | ${{ found: 'iphone', forbidden: false, noSuggest: true }}
    `('find "$word" $options', async ({ word, options, expected }) => {
        expect(dict.find(word, options)).toEqual(expected);
    });

    test.each`
        word                         | ignoreCase   | expected
        ${''}                        | ${undefined} | ${false}
        ${'avocado'}                 | ${false}     | ${false}
        ${'avocado'}                 | ${undefined} | ${true}
        ${'avocado'}                 | ${true}      | ${true}
        ${'Avocado'}                 | ${undefined} | ${true}
        ${'avocadoS'}                | ${undefined} | ${true}
        ${'AvocadoS'}                | ${undefined} | ${true}
        ${'Café'}                    | ${false}     | ${true}
        ${'cafe'}                    | ${false}     | ${false}
        ${'cafe'}                    | ${true}      | ${true}
        ${'îphone'.normalize('NFC')} | ${true}      | ${true}
        ${'îphone'.normalize('NFD')} | ${true}      | ${true}
        ${'english'}                 | ${undefined} | ${true}
        ${'English'}                 | ${undefined} | ${true}
        ${'grumpy'}                  | ${undefined} | ${true}
        ${'Grumpy'}                  | ${undefined} | ${true}
    `('isNoSuggestWord of "$word" ignoreCase: $ignoreCase', async ({ word, ignoreCase, expected }) => {
        expect(dict.isNoSuggestWord(word, { ignoreCase })).toEqual(expected);
    });

    test.each`
        word          | expected
        ${'avocado'}  | ${false}
        ${'Avocado'}  | ${false}
        ${''}         | ${false}
        ${'English'}  | ${false}
        ${'english'}  | ${false}
        ${'avocadoS'} | ${false}
        ${'AvocadoS'} | ${false}
        ${'grumpy'}   | ${false}
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
