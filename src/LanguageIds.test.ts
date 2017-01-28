import {expect} from 'chai';
import * as LangId from './LanguageIds';

describe('Validate LanguageIds', () => {
    it('tests looking up a few extensions', () => {
        expect(LangId.getLanguagesForExt('ts')).to.contain('typescript');
        expect(LangId.getLanguagesForExt('.tex')).to.contain('latex');
        expect(LangId.getLanguagesForExt('tex')).to.contain('latex');
    });
});
