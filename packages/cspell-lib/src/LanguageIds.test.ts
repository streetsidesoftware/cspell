import * as LangId from './LanguageIds';
import { genSequence } from 'gensequence';

describe('Validate LanguageIds', () => {
    test('tests looking up a few extensions', () => {
        expect(LangId.getLanguagesForExt('ts')).toEqual(
            expect.arrayContaining(['typescript'])
        );
        expect(LangId.getLanguagesForExt('.tex')).toEqual(
            expect.arrayContaining(['latex'])
        );
        expect(LangId.getLanguagesForExt('tex')).toEqual(
            expect.arrayContaining(['latex'])
        );
        expect(LangId.getLanguagesForExt('hs')).toEqual(
            expect.arrayContaining(['haskell'])
        );
    });

    test('test that all extensions start with a .', () => {
        const ids = LangId.buildLanguageExtensionMap(
            LangId.languageExtensionDefinitions
        );
        const badExtensions = genSequence(ids.keys())
            .filter((ext) => ext[0] !== '.')
            .toArray();
        expect(Object.keys(badExtensions)).toHaveLength(0);
    });
});
