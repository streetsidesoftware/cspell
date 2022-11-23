import { mapperNormalizeNFC, mapperRemoveCaseAndAccents } from './textMappers';

describe('textMappers', () => {
    test.each`
        words                        | expected
        ${[]}                        | ${[]}
        ${['Cafe']}                  | ${['cafe']}
        ${['Café']}                  | ${['café', 'cafe']}
        ${['Café'.normalize('NFD')]} | ${['café'.normalize('NFD'), 'cafe']}
        ${['CAFÉ'.normalize('NFC')]} | ${['café'.normalize('NFC'), 'cafe']}
        ${['CAFÉ'.normalize('NFD')]} | ${['café'.normalize('NFD'), 'cafe']}
    `('mapperRemoveCaseAndAccents', ({ words, expected }) => {
        expect([...mapperRemoveCaseAndAccents(words)]).toEqual(expected);
    });

    test.each`
        words                        | expected
        ${['Cafe']}                  | ${['Cafe']}
        ${['Café'.normalize('NFC')]} | ${['Café'.normalize('NFC')]}
        ${['Café'.normalize('NFD')]} | ${['Café'.normalize('NFC')]}
    `('mapperNormalizeNFC', ({ words, expected }) => {
        expect([...mapperNormalizeNFC(words)]).toEqual(expected);
    });
});
