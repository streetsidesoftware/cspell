import * as Text from './util/text';
import * as tds from './TextDocumentSettings';

export const diagSource = 'cSpell Checker';

import { CSpellUserSettings } from './CSpellSettingsDef';
import * as TV from './textValidator';

export function validateText(text: string, settings: CSpellUserSettings): Promise<Text.WordOffset[]> {
    const dict = tds.getDictionary(settings);
    return dict.then(dict => [...TV.validateText(text, dict, settings)]);
}


