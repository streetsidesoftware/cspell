import * as LangId from './LanguageIds';
import { genSequence } from 'gensequence';

describe('Validate LanguageIds', () => {
    test('tests looking up a few extensions', () => {
        expect(LangId.getLanguagesForExt('ts')).toEqual(expect.arrayContaining(['typescript']));
        expect(LangId.getLanguagesForExt('.tex')).toEqual(expect.arrayContaining(['latex']));
        expect(LangId.getLanguagesForExt('tex')).toEqual(expect.arrayContaining(['latex']));
        expect(LangId.getLanguagesForExt('hs')).toEqual(expect.arrayContaining(['haskell']));
    });

    test('that all extensions start with a .', () => {
        const ids = LangId.buildLanguageExtensionMap(LangId.languageExtensionDefinitions);
        const badExtensions = genSequence(ids.keys())
            .filter((ext) => ext[0] !== '.')
            .toArray();
        expect(Object.keys(badExtensions)).toHaveLength(0);
    });

    test.each`
        ext        | expected
        ${'.md'}   | ${false}
        ${'.exe'}  | ${true}
        ${'.obj'}  | ${true}
        ${'.dll'}  | ${true}
        ${'.gif'}  | ${true}
        ${'.jpeg'} | ${true}
        ${'.jpg'}  | ${true}
        ${'.txt'}  | ${false}
        ${'md'}    | ${false}
        ${'exe'}   | ${true}
        ${'obj'}   | ${true}
        ${'dll'}   | ${true}
        ${'gif'}   | ${true}
        ${'txt'}   | ${false}
    `('isBinaryExt $ext => $expected', ({ ext, expected }) => {
        expect(LangId.isBinaryExt(ext)).toBe(expected);
    });

    test.each`
        ext        | expected
        ${'.md'}   | ${false}
        ${'.exe'}  | ${true}
        ${'.obj'}  | ${true}
        ${'.dll'}  | ${true}
        ${'.gif'}  | ${true}
        ${'.jpeg'} | ${true}
        ${'.jpg'}  | ${true}
        ${'.txt'}  | ${false}
        ${'md'}    | ${false}
        ${'exe'}   | ${true}
        ${'obj'}   | ${true}
        ${'dll'}   | ${true}
        ${'gif'}   | ${true}
        ${'txt'}   | ${false}
        ${'pdf'}   | ${true}
        ${'lock'}  | ${true}
    `('isGeneratedExt $ext => $expected', ({ ext, expected }) => {
        expect(LangId.isGeneratedExt(ext)).toBe(expected);
    });
});
