import { CSpellSettingsWithSourceTrace, CSpellUserSettings } from '@cspell/cspell-types';
import { readFile } from 'fs-extra';
import { URI } from 'vscode-uri';
import { getLanguagesForExt } from './LanguageIds';
import {
    calcOverrideSettings,
    getDefaultSettings,
    getGlobalSettings,
    loadConfig,
    mergeSettings,
    searchForConfig,
} from './Settings';
import { validateText, ValidationIssue } from './validator';
import * as path from 'path';
import { combineTextAndLanguageSettings } from './Settings/TextDocumentSettings';

export interface SpellCheckFileOptions {
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

export interface SpellCheckFileResult {
    document: Document | DocumentWithText;
    settingsUsed: CSpellSettingsWithSourceTrace;
    localConfigFilepath: string | undefined;
    options: SpellCheckFileOptions;
    issues: ValidationIssue[];
    checked: boolean;
    errors: Error[] | undefined;
}

const defaultEncoding: BufferEncoding = 'utf8';

export type UriString = string;

export interface DocumentWithText extends Document {
    text: string;
}
export interface Document {
    uri: UriString;
    text?: string;
    languageId?: string;
    locale?: string;
}

/**
 * Spell Check a file
 * @param file - absolute path to file to read and check.
 * @param options - options to control checking
 * @param settings - default settings to use.
 */
export function spellCheckFile(
    file: string,
    options: SpellCheckFileOptions,
    settings: CSpellUserSettings
): Promise<SpellCheckFileResult> {
    const doc: Document = {
        uri: URI.file(file).toString(),
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
    settings: CSpellUserSettings
): Promise<SpellCheckFileResult> {
    try {
        return spellCheckFullDocument(await resolveDocument(document), options, settings);
    } catch (e) {
        return {
            document,
            options,
            settingsUsed: settings,
            localConfigFilepath: undefined,
            issues: [],
            checked: false,
            errors: [e],
        };
    }
}

async function spellCheckFullDocument(
    document: DocumentWithText,
    options: SpellCheckFileOptions,
    settings: CSpellUserSettings
): Promise<SpellCheckFileResult> {
    const errors: Error[] = [];
    function addPossibleError(error: Error | undefined) {
        if (!error) return;
        errors.push(error);
    }

    function catchError<P>(p: Promise<P>): Promise<P | undefined> {
        return p.catch((error) => {
            addPossibleError(error);
            return undefined;
        });
    }

    const useSearchForConfig =
        (!options.noConfigSearch && !settings.noConfigSearch) || options.noConfigSearch === false;
    const pLocalConfig = options.configFile
        ? catchError(loadConfig(options.configFile))
        : useSearchForConfig
        ? catchError(searchForDocumentConfig(document, settings))
        : undefined;
    const localConfig = await pLocalConfig;

    addPossibleError(localConfig?.__importRef?.error);

    if (errors.length) {
        return {
            document,
            options,
            settingsUsed: localConfig || settings,
            localConfigFilepath: localConfig?.__importRef?.filename,
            issues: [],
            checked: false,
            errors,
        };
    }

    const config = localConfig ? mergeSettings(settings, localConfig) : settings;
    const docSettings = determineFinalDocumentSettings(document, config);

    const shouldCheck = docSettings.settings.enabled ?? true;

    const issues = shouldCheck ? await validateText(document.text, docSettings.settings) : [];

    const result: SpellCheckFileResult = {
        document,
        options,
        settingsUsed: docSettings.settings,
        localConfigFilepath: localConfig?.__importRef?.filename,
        issues,
        checked: shouldCheck,
        errors: undefined,
    };

    return result;
}

function searchForDocumentConfig(
    document: DocumentWithText,
    defaultConfig: CSpellSettingsWithSourceTrace
): Promise<CSpellSettingsWithSourceTrace> {
    const { uri } = document;
    const u = URI.parse(uri);
    if (u.scheme !== 'file') return Promise.resolve(defaultConfig);
    return searchForConfig(u.fsPath).then((s) => s || defaultConfig);
}

async function readDocument(filename: string, encoding: BufferEncoding = defaultEncoding): Promise<DocumentWithText> {
    const text = await readFile(filename, encoding);
    const uri = URI.file(filename).toString();

    return {
        uri,
        text,
    };
}

function resolveDocument(document: DocumentWithText | Document, encoding?: BufferEncoding): Promise<DocumentWithText> {
    if (isDocumentWithText(document)) return Promise.resolve(document);
    const uri = URI.parse(document.uri);
    if (uri.scheme !== 'file') {
        throw new Error(`Unsupported schema: "${uri.scheme}", open "${uri.toString()}"`);
    }
    return readDocument(uri.fsPath, encoding);
}

function isDocumentWithText(doc: DocumentWithText | Document): doc is DocumentWithText {
    return doc.text !== undefined;
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
export function determineFinalDocumentSettings(
    document: DocumentWithText,
    settings: CSpellUserSettings
): DetermineFinalDocumentSettingsResult {
    const uri = URI.parse(document.uri);
    const filename = uri.fsPath;
    const ext = path.extname(filename);
    const settingsWithDefaults = mergeSettings(getDefaultSettings(), getGlobalSettings(), settings);
    const fileSettings = calcOverrideSettings(settingsWithDefaults, filename);
    const languageIds = document.languageId
        ? document.languageId
        : fileSettings.languageId
        ? fileSettings.languageId
        : getLanguagesForExt(ext);
    if (document.locale) {
        fileSettings.language = document.locale;
    }
    const config = combineTextAndLanguageSettings(fileSettings, document.text, languageIds);
    return {
        document,
        settings: config,
    };
}

export function fileToDocument(file: string): Document;
export function fileToDocument(file: string, text: string, languageId?: string, locale?: string): DocumentWithText;
export function fileToDocument(
    file: string,
    text?: string,
    languageId?: string,
    locale?: string
): Document | DocumentWithText;
export function fileToDocument(
    file: string,
    text?: string,
    languageId?: string,
    locale?: string
): Document | DocumentWithText {
    return {
        uri: URI.file(file).toString(),
        text,
        languageId,
        locale,
    };
}
