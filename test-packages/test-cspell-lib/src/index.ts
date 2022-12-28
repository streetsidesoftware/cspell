import assert from 'assert';
import { validateText, combineTextAndLanguageSettings, finalizeSettings, getDefaultSettings } from 'cspell-lib';

// cspell:ignore wordz coztom clockz cuztom
const customWords = ['wordz', 'cuztom', 'clockz'];

async function spellcheckerFactory(customWords: string[] = []) {
    const settings = {
        ...getDefaultSettings(),
        words: customWords,
    };

    const fileSettings = combineTextAndLanguageSettings(settings, '', ['plaintext']);
    const finalSettings = finalizeSettings(fileSettings);

    return (phrase: string) => {
        return validateText(phrase, finalSettings, { generateSuggestions: true });
    };
}

const checkSpelling = async (phrase: string) => {
    const spellChecker = await spellcheckerFactory(customWords);
    return spellChecker(phrase);
};

async function run() {
    const r = await checkSpelling('These are my coztom wordz.');
    console.log(r);
    assert(r.length === 1, 'Make sure we got 1 spelling issue back.');
    assert(r[0].text === 'coztom');
    assert(r[0].suggestions?.includes('cuztom'));
    // console.log('%o', r);
}

run();
