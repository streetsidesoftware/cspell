import * as Text from './text';

// cSpell:ignore Ápple DBAs ctrip γάμμα

describe('Util Text', () => {
    test('tests matchCase', () => {
        expect(Text.matchCase('Apple', 'orange')).toBe('Orange');
        expect(Text.matchCase('apple', 'ORANGE')).toBe('orange');
        expect(Text.matchCase('apple', 'orange')).toBe('orange');
        expect(Text.matchCase('APPLE', 'orange')).toBe('ORANGE');
        expect(Text.matchCase('ApPlE', 'OrangE')).toBe('OrangE');
        expect(Text.matchCase('apPlE', 'OrangE')).toBe('orangE');
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
