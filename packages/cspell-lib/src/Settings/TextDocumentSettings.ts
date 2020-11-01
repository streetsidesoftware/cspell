import { calcSettingsForLanguageId } from './LanguageSettings';
import { CSpellUserSettings, CSpellSettings } from './CSpellSettingsDef';
import { mergeSettings } from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';

export function combineTextAndLanguageSettings(
    settings: CSpellUserSettings,
    text: string,
    languageId: string | string[]
): CSpellUserSettings {
    const docSettings = extractSettingsFromText(text);
    const settingsForText = mergeSettings(settings, docSettings);
    const langSettings = calcSettingsForLanguageId(settingsForText, languageId);
    // Merge again, to force In-Doc settings.
    return mergeSettings(langSettings, docSettings);
}

export function extractSettingsFromText(text: string): CSpellSettings {
    return getInDocumentSettings(text);
}
