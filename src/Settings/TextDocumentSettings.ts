import { calcUserSettingsForLanguage } from './LanguageSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import * as CSpellSettings from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';

export function extractSettingsFromText(settings: CSpellUserSettings, text: string, languageId: string | string[]) {
    const langIds: string[] = ['*'].concat(languageId instanceof Array ? languageId : [languageId]);
    const langSettings = langIds.reduce((settings, languageId) => {
        return calcUserSettingsForLanguage(settings, languageId);
    }, settings);
    return CSpellSettings.mergeSettings(langSettings, getInDocumentSettings(text));
}

