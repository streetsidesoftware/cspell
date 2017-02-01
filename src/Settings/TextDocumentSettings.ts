import { calcSettingsForLanguageId } from './LanguageSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import * as CSpellSettings from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';

export function combineTextAndLanguageSettings(settings: CSpellUserSettings, text: string, languageId: string | string[]) {
    const langSettings = calcSettingsForLanguageId(settings, languageId);
    return CSpellSettings.mergeSettings(langSettings, extractSettingsFromText(text));
}

export function extractSettingsFromText(text: string) {
    return getInDocumentSettings(text);
}

