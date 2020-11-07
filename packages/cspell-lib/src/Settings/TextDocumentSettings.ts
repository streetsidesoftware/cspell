import { calcSettingsForLanguageId } from './LanguageSettings';
import { CSpellSettings, CSpellUserSettings } from './CSpellSettingsDef';
import * as CSpellSettingsServer from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';

export function combineTextAndLanguageSettings(
    settings: CSpellUserSettings,
    text: string,
    languageId: string | string[]
): CSpellUserSettings {
    const docSettings = extractSettingsFromText(text);
    const settingsForText = CSpellSettingsServer.mergeSettings(settings, docSettings);
    const langSettings = calcSettingsForLanguageId(settingsForText, languageId);
    // Merge again, to force In-Doc settings.
    return CSpellSettingsServer.mergeSettings(langSettings, docSettings);
}

export function extractSettingsFromText(text: string): CSpellSettings {
    return getInDocumentSettings(text);
}
