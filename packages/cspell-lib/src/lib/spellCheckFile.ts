import type { CSpellSettingsWithSourceTrace, CSpellUserSettings } from '@cspell/cspell-types';

import type { Document, DocumentWithText } from './Document/index.js';
import { isBinaryDoc } from './Document/isBinaryDoc.js';
import { documentToTextDocument, resolveDocument } from './Document/resolveDocument.js';
import { createTextDocument } from './Models/TextDocument.js';
import { createPerfTimer } from './perf/index.js';
import { determineTextDocumentSettings } from './textValidation/determineTextDocumentSettings.js';
import type { DocumentValidatorOptions } from './textValidation/index.js';
import { DocumentValidator } from './textValidation/index.js';
import { isError } from './util/errors.js';
import type { Uri } from './util/Uri.js';
import { toUri } from './util/Uri.js';
import type { ValidateTextOptions, ValidationIssue } from './validator.js';

export interface SpellCheckFileOptions extends ValidateTextOptions {
    /**
     * Optional path to a configuration file.
     * If given, it will be used instead of searching for a configuration file.
     */
    configFile?: string;
    /**
     * File encoding
     * @defaultValue 'utf-8'
     */
    encoding?: BufferEncoding;
    /**
     * Prevents searching for local configuration files
     * By default the spell checker looks for configuration files
     * starting at the location of given filename.
     * If `configFile` is defined it will still be loaded instead of searching.
     * `false` will override the value in `settings.noConfigSearch`.
     * @defaultValue undefined
     */
    noConfigSearch?: boolean;
}

export interface SpellCheckFilePerf extends Record<string, number | undefined> {
    loadTimeMs?: number;
    prepareTimeMs?: number;
    checkTimeMs?: number;
    totalTimeMs?: number;
}

export interface SpellCheckFileResult {
    document: Document | DocumentWithText;
    settingsUsed: CSpellSettingsWithSourceTrace;
    localConfigFilepath: string | undefined;
    options: SpellCheckFileOptions;
    issues: ValidationIssue[];
    checked: boolean;
    errors: Error[] | undefined;
    perf?: SpellCheckFilePerf;
}

/**
 * Spell Check a file
 * @param file - absolute path to file to read and check.
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
export function spellCheckFile(
    file: string | Uri | URL,
    options: SpellCheckFileOptions,
    settings: CSpellUserSettings,
): Promise<SpellCheckFileResult> {
    const doc: Document = {
        uri: toUri(file).toString(),
    };
    return spellCheckDocument(doc, options, settings);
}

/**
 * Spell Check a Document.
 * @param document - document to be checked. If `document.text` is `undefined` the file will be loaded
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
export async function spellCheckDocument(
    document: Document | DocumentWithText,
    options: SpellCheckFileOptions,
    settings: CSpellUserSettings,
): Promise<SpellCheckFileResult> {
    if (isBinaryDoc(document)) {
        return {
            document,
            options,
            settingsUsed: settings,
            localConfigFilepath: undefined,
            issues: [],
            checked: false,
            errors: undefined,
        };
    }
    try {
        const timer = createPerfTimer('loadFile');
        const doc = await resolveDocument(document).finally(() => timer.end());
        const result = await spellCheckFullDocument(doc, options, settings);
        const perf = result.perf || {};
        perf.loadTimeMs = timer.elapsed;
        result.perf = perf;
        return result;
    } catch (e) {
        const errors = isError(e) ? [e] : [];
        return {
            document,
            options,
            settingsUsed: settings,
            localConfigFilepath: undefined,
            issues: [],
            checked: false,
            errors,
        };
    }
}

async function spellCheckFullDocument(
    document: DocumentWithText,
    options: SpellCheckFileOptions,
    settings: CSpellUserSettings,
): Promise<SpellCheckFileResult> {
    // if (options.skipValidation) {
    //     return {
    //         document,
    //         options,
    //         settingsUsed: settings,
    //         localConfigFilepath: undefined,
    //         issues: [],
    //         checked: true,
    //         errors: undefined,
    //     };
    // }

    const perf: SpellCheckFilePerf = {};
    const timer = createPerfTimer('spellCheckFullDocument', (elapsed) => (perf.totalTimeMs = elapsed));
    const timerCheck = createPerfTimer('check', (elapsed) => (perf.checkTimeMs = elapsed));
    const timerPrepare = createPerfTimer('prepare', (elapsed) => (perf.prepareTimeMs = elapsed));

    const doc = documentToTextDocument(document);
    const docValOptions: DocumentValidatorOptions = options;
    const docValidator = new DocumentValidator(doc, docValOptions, settings);
    await docValidator.prepare().finally(() => timerPrepare.end());
    Object.assign(perf, Object.fromEntries(Object.entries(docValidator.perfTiming).map(([k, v]) => ['_' + k, v])));

    const prep = docValidator._getPreparations();

    if (docValidator.errors.length) {
        return {
            document,
            options,
            settingsUsed: prep?.localConfig || settings,
            localConfigFilepath: prep?.localConfigFilepath,
            issues: [],
            checked: false,
            errors: docValidator.errors,
            perf,
        };
    }

    timerCheck.start();
    const issues = docValidator.checkDocument();
    timerCheck.end();

    const result: SpellCheckFileResult = {
        document,
        options,
        settingsUsed: docValidator.getFinalizedDocSettings(),
        localConfigFilepath: prep?.localConfigFilepath,
        issues,
        checked: docValidator.shouldCheckDocument(),
        errors: undefined,
        perf,
    };
    timer.end();
    return result;
}

export interface DetermineFinalDocumentSettingsResult {
    document: DocumentWithText;
    settings: CSpellSettingsWithSourceTrace;
}

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
export async function determineFinalDocumentSettings(
    document: DocumentWithText,
    settings: CSpellUserSettings,
): Promise<DetermineFinalDocumentSettingsResult> {
    const doc = createTextDocument({
        uri: document.uri,
        content: document.text,
        languageId: document.languageId,
        locale: document.locale,
    });
    return {
        document,
        settings: await determineTextDocumentSettings(doc, settings),
    };
}
