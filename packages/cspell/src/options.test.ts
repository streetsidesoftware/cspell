import { fixLegacy } from './options';

describe('options', () => {
    test.each`
        options                             | expected
        ${{}}                               | ${{}}
        ${{ local: 'en' }}                  | ${{ locale: 'en' }}
        ${{ locale: 'en' }}                 | ${{ locale: 'en' }}
        ${{ local: 'en', locale: 'en-gb' }} | ${{ locale: 'en-gb' }}
    `('fixLegacy', ({ options, expected }) => {
        expect(fixLegacy(options)).toEqual(expected);
    });
});
