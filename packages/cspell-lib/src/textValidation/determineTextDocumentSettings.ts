import { CSpellUserSettings } from '@cspell/cspell-types';
import * as path from 'path';
import { getLanguagesForBasename } from '../LanguageIds';
import { CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import { TextDocument } from '../Models/TextDocument';
import { calcOverrideSettings, getDefaultSettings, getGlobalSettings, mergeSettings } from '../Settings';
import { combineTextAndLanguageSettings } from '../Settings/TextDocumentSettings';

/**
 * Combines all relevant setting values into a final configuration to be used for spell checking.
 * It applies any overrides and appropriate language settings by taking into account the document type (languageId)
 * the locale (natural language) and any in document settings.
 *
 * Note: this method will not search for configuration files. Configuration files should already be merged into `settings`.
 * It is NOT necessary to include the cspell defaultSettings or globalSettings. They will be applied within this function.
 * @param document - The document to be spell checked. Note: if the URI doesn't have a path, overrides cannot be applied.
 *   `locale` - if defined will be used unless it is overridden by an in-document setting.
 *   `languageId` - if defined will be used to select appropriate file type dictionaries.
 * @param settings - The near final settings. Should already be the combination of all configuration files.
 */

export function determineTextDocumentSettings(doc: TextDocument, settings: CSpellUserSettings): CSpellSettingsInternal {
    const filename = doc.uri.fsPath;
    const settingsWithDefaults = mergeSettings(
        getDefaultSettings(settings.loadDefaultConfiguration ?? true),
        getGlobalSettings(),
        settings
    );
    const fileSettings = calcOverrideSettings(settingsWithDefaults, filename);
    const languageIds = fileSettings?.languageId?.length
        ? fileSettings.languageId
        : doc.languageId
        ? doc.languageId
        : getLanguageForFilename(filename);
    if (doc.locale) {
        fileSettings.language = doc.locale;
    }
    return combineTextAndLanguageSettings(fileSettings, doc.text, languageIds);
}

function getLanguageForFilename(filename: string): string[] {
    const basename = path.basename(filename);
    return getLanguagesForBasename(basename);
}
