import type { CSpellSettings, CSpellUserSettings } from '@cspell/cspell-types';

import type { CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import * as CSpellSettingsServer from './CSpellSettingsServer';
import { getInDocumentSettings } from './InDocSettings';
import { calcSettingsForLanguageId } from './LanguageSettings';

export function combineTextAndLanguageSettings(
    settings: CSpellUserSettings,
    text: string,
    languageId: string | string[]
): CSpellSettingsInternal {
    const docSettings = extractSettingsFromText(text);
    const settingsForText = CSpellSettingsServer.mergeSettings(settings, docSettings);
    const langSettings = calcSettingsForLanguageId(settingsForText, languageId);
    // Merge again, to force In-Doc settings.
    return CSpellSettingsServer.mergeSettings(langSettings, docSettings);
}

export function extractSettingsFromText(text: string): CSpellSettings {
    return getInDocumentSettings(text);
}
