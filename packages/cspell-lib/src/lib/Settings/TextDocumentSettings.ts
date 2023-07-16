import type { CSpellSettings, CSpellUserSettings } from '@cspell/cspell-types';

import type { CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef.js';
import * as CSpellSettingsServer from './CSpellSettingsServer.js';
import { getInDocumentSettings } from './InDocSettings.js';
import { calcSettingsForLanguageId } from './LanguageSettings.js';

export function combineTextAndLanguageSettings(
    settings: CSpellUserSettings,
    text: string | undefined,
    languageId: string | string[],
): CSpellSettingsInternal {
    if (!text) {
        return CSpellSettingsServer.toInternalSettings(calcSettingsForLanguageId(settings, languageId));
    }
    const docSettings = extractSettingsFromText(text);
    const settingsForText = CSpellSettingsServer.mergeSettings(settings, docSettings);
    const langSettings = calcSettingsForLanguageId(settingsForText, languageId);
    // Merge again, to force In-Doc settings.
    return CSpellSettingsServer.mergeSettings(langSettings, docSettings);
}

export function extractSettingsFromText(text: string): CSpellSettings {
    return getInDocumentSettings(text);
}
