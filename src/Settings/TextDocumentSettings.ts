import { calcSettingsForLanguageId } from './LanguageSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import * as CSpellSettings from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';

export function combineTextAndLanguageSettings(settings: CSpellUserSettings, text: string, languageId: string | string[]): CSpellUserSettings {
    const docSettings = extractSettingsFromText(text);
    const settingsForText = CSpellSettings.mergeSettings(settings, docSettings);
    const langSettings = calcSettingsForLanguageId(settingsForText, languageId);
    // Merge again, to force In-Doc settings.
    return CSpellSettings.mergeSettings(langSettings, docSettings);
}

export function extractSettingsFromText(text: string) {
    return getInDocumentSettings(text);
}

