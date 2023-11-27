import type { CSpellSettings, CSpellUserSettings } from '@cspell/cspell-types';

import type { CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef.js';
import { mergeSettings, toInternalSettings } from './CSpellSettingsServer.js';
import { getInDocumentSettings } from './InDocSettings.js';
import { calcSettingsForLanguageId } from './LanguageSettings.js';

export function combineTextAndLanguageSettings(
    settings: CSpellUserSettings,
    text: string | undefined,
    languageId: string | string[],
): CSpellSettingsInternal {
    if (!text) {
        return toInternalSettings(calcSettingsForLanguageId(settings, languageId));
    }
    const docSettings = extractSettingsFromText(text);
    const settingsForText = mergeSettings(settings, docSettings);
    const langSettings = calcSettingsForLanguageId(settingsForText, languageId);
    // Merge again, to force In-Doc settings.
    return mergeSettings(langSettings, docSettings);
}

export function extractSettingsFromText(text: string): CSpellSettings {
    return getInDocumentSettings(text);
}
