import {expect} from 'chai';
import * as LangId from './LanguageIds';
import {genSequence} from 'gensequence';

describe('Validate LanguageIds', () => {
    it('tests looking up a few extensions', () => {
        expect(LangId.getLanguagesForExt('ts')).to.contain('typescript');
        expect(LangId.getLanguagesForExt('.tex')).to.contain('latex');
        expect(LangId.getLanguagesForExt('tex')).to.contain('latex');
    });

    it('test that all extensions start with a .', () => {
        const ids = LangId.buildLanguageExtensionMap(LangId.languageExtensionDefinitions);
        const badExtensions = genSequence(ids.keys())
            .filter(ext => ext[0] !== '.')
            .toArray();
        expect(badExtensions, 'All extensions are expected to begin with a .').to.be.empty;
    });

});
