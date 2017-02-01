import * as Text from './util/text';
import * as Dictionary from './SpellingDictionary';
import * as Settings from './Settings';

export const diagSource = 'cSpell Checker';

import { CSpellUserSettings } from './Settings';
import * as TV from './textValidator';

export function validateText(text: string, settings: CSpellUserSettings): Promise<Text.TextOffset[]> {
    const finalSettings = Settings.finalizeSettings(settings);
    const dict = Dictionary.getDictionary(finalSettings);
    return dict.then(dict => [...TV.validateText(text, dict, finalSettings)]);
}


