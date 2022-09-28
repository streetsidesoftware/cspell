import * as Text from './text';

// cSpell:ignore Ápple DBAs ctrip γάμμα

describe('Util Text', () => {
    test.each`
        example     | word        | expected
        ${'Apple'}  | ${'orange'} | ${'Orange'}
        ${'apple'}  | ${'ORANGE'} | ${'orange'}
        ${'apple'}  | ${'orange'} | ${'orange'}
        ${'APPLE'}  | ${'orange'} | ${'ORANGE'}
        ${'ApPlE'}  | ${'OrangE'} | ${'OrangE'}
        ${'apPlE'}  | ${'OrangE'} | ${'orangE'}
        ${'_Apple'} | ${'orange'} | ${'orange'}
        ${'_Apple'} | ${'Orange'} | ${'Orange'}
    `('tests matchCase', ({ example, word, expected }) => {
        expect(Text.matchCase(example, word)).toBe(expected);
    });

    test('case of Chinese characters', () => {
        expect(Text.isUpperCase('携程旅行网')).toBe(false);
        expect(Text.isLowerCase('携程旅行网')).toBe(false);
    });
});

describe('Test the text matching functions', () => {
    test('isUpperCase', () => {
        expect(Text.isUpperCase('first')).toBe(false);
        expect(Text.isUpperCase('First')).toBe(false);
        expect(Text.isUpperCase('FIRST')).toBe(true);
    });
    test('isLowerCase', () => {
        expect(Text.isLowerCase('first')).toBe(true);
        expect(Text.isLowerCase('First')).toBe(false);
        expect(Text.isLowerCase('FIRST')).toBe(false);
    });
    test('isFirstCharacterUpper', () => {
        expect(Text.isFirstCharacterUpper('first')).toBe(false);
        expect(Text.isFirstCharacterUpper('First')).toBe(true);
        expect(Text.isFirstCharacterUpper('FIRST')).toBe(true);
    });
    test('isFirstCharacterLower', () => {
        expect(Text.isFirstCharacterLower('first')).toBe(true);
        expect(Text.isFirstCharacterLower('First')).toBe(false);
        expect(Text.isFirstCharacterLower('FIRST')).toBe(false);
    });
    // cSpell:ignore áello firstname
    test('ucFirst', () => {
        expect(Text.ucFirst('hello')).toBe('Hello');
        expect(Text.ucFirst('Hello')).toBe('Hello');
        expect(Text.ucFirst('áello')).toBe('Áello');
    });
    test('lcFirst', () => {
        expect(Text.lcFirst('hello')).toBe('hello');
        expect(Text.lcFirst('Hello')).toBe('hello');
        expect(Text.lcFirst('áello')).toBe('áello');
        expect(Text.lcFirst('Áello')).toBe('áello');
    });
});

describe('accents', () => {
    test.each`
        word                              | expected
        ${'hello'}                        | ${'hello'}
        ${'café résumé'.normalize('NFC')} | ${'cafe resume'}
        ${'café résumé'.normalize('NFD')} | ${'cafe resume'}
    `('removeAccents $word', ({ word, expected }) => {
        expect(Text.removeAccents(word)).toBe(expected);
    });

    test.each`
        word                              | expected
        ${'hello'}                        | ${'hello'}
        ${'café résumé'.normalize('NFC')} | ${'café résumé'}
        ${'café résumé'.normalize('NFD')} | ${'cafe resume'}
    `('removeUnboundAccents $word', ({ word, expected }) => {
        expect(Text.removeUnboundAccents(word)).toBe(expected);
    });
});
