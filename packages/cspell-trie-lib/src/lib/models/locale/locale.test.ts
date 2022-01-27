import { Locale, parseLocale } from './locale';

describe('locale', () => {
    const T = true;
    const F = false;
    test.each`
        locale     | valid | language     | country            | expected
        ${''}      | ${F}  | ${undefined} | ${undefined}       | ${''}
        ${'en'}    | ${T}  | ${'English'} | ${undefined}       | ${'en'}
        ${'en_us'} | ${T}  | ${'English'} | ${'United States'} | ${'en-US'}
        ${'nlNl'}  | ${T}  | ${'Dutch'}   | ${'Netherlands'}   | ${'nl-NL'}
    `('locale "$locale"', ({ locale, valid, language, country, expected }) => {
        const r = new Locale(locale);
        expect(r.locale).toEqual(expected);
        expect(r.isValid()).toBe(valid);
        expect(r.localInfo()?.language).toBe(language);
        expect(r.localInfo()?.country).toBe(country);
    });

    test.each`
        locale          | expected
        ${''}           | ${''}
        ${'en'}         | ${'en'}
        ${'en_us'}      | ${'en-US'}
        ${'en,  en_us'} | ${'en, en-US'}
        ${'nlNl'}       | ${'nl-NL'}
    `('parseLocale "$locale"', ({ locale, expected }) => {
        const r = parseLocale(locale);
        expect(r.join(', ')).toBe(expected);
    });
});
