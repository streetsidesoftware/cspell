import assert from 'assert';
// eslint-disable-next-line node/no-unpublished-import
import { spellCheckDocument } from 'cspell-lib';

// cspell:ignore wordz coztom clockz cuztom
const customWords = ['wordz', 'cuztom', 'clockz'];

async function checkSpelling(phrase: string) {
    const result = await spellCheckDocument(
        { uri: 'text.txt', text: phrase, languageId: 'plaintext', locale: 'en' },
        { generateSuggestions: true, noConfigSearch: true },
        { words: customWords, suggestionsTimeout: 2000 }
    );
    return result.issues;
}

export async function run() {
    console.log(`Start: ${new Date().toISOString()}`);
    const r = await checkSpelling('These are my coztom wordz.');
    console.log(`End: ${new Date().toISOString()}`);
    // console.log(r);
    assert(r.length === 1, 'Make sure we got 1 spelling issue back.');
    assert(r[0].text === 'coztom');
    assert(r[0].suggestions?.includes('cuztom'));
    // console.log('%o', r);
}
