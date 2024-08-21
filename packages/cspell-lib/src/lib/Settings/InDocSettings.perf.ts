import type { CSpellUserSettings } from '@cspell/cspell-types';
import { suite } from 'perf-insight';

import { __internal, getInDocumentSettings } from './InDocSettings.js';

suite('Get InDocSettings', async (test) => {
    const doc = sampleDoc();
    const iterations = 10;

    test('getInDocumentSettings', () => {
        let settings: CSpellUserSettings | undefined = undefined;
        for (let i = iterations; i > 0; --i) {
            settings = getInDocumentSettings(doc);
        }
        return settings;
    });
});

suite('Collect InDocSettings', async (test) => {
    const doc = sampleDoc();
    const iterations = 10;

    test('collectInDocumentSettings', () => {
        let settings: unknown | undefined = undefined;
        for (let i = iterations; i > 0; --i) {
            settings = __internal.collectInDocumentSettings(doc);
        }
        return settings;
    });
});

function sampleDoc() {
    return `
    // cSpell\u003AenableCompoundWords
    // cSpell\u003AdisableCompoundWords
    // cSpell\u003A enableCOMPOUNDWords
    // cSpell:words whiteberry, redberry, lightbrown
    // cSpell\u003A ignoreRegExp /\\/\\/\\/.*/
    // cSpell\u003AignoreRegexp w\\w+berry
    // cSpell\u003A:ignoreRegExp  /
    /* cSpell\u003AignoreRegExp \\w+s{4}\\w+ */
    /* cSpell\u003AignoreRegExp /faullts[/]?/ */
    const berries = ['whiteberry', 'redberry', 'blueberry'];

    /* cSpell\u003Aignore tripe, comment */
    // cSpell\u003A: ignoreWords tooo faullts
    /// ignore triple comment, with misssspellings and faullts
    /// mooree prooobleems onn thisss line tooo with wordberry
    // misssspellings faullts

    // weirdberry can be straange.
    // cSpell\u003Alanguage en-US
    // cspell\u003Alocal
    // cspell\u003Alocale es-ES
    // cspell\u003Alocal en, nl

    // cspell\u003Adictionaries lorem-ipsum
    // LocalWords: one two three
    // LocalWords:four five six
    // localwords: seven eight nine

    // cspell:ignore againxx
# cSpell\u003AdisableCompoundWords
# cSpell\u003AenableCOMPOUNDWords
# happydays arehere againxx

// cspell:ignore popoutlist

// spell\u003Adictionaries php
// spell\u003Awords const
// cspell\u003A
// cspell\u003Aignore popoutlist
const x = imp.popoutlist;
// cspell\u003Aignore again

    // cspell:ignore happydays arehere againxx localwords weirdberry straange misssspellings
    // cspell:ignore faullts mooree prooobleems onn thisss line tooo wordberry
`;
}
