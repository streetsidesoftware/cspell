import type { CSpellSettingsWithSourceTrace, CSpellUserSettings } from '@cspell/cspell-types';
import { readFile } from 'fs-extra';
import { URI, Utils as UriUtils } from 'vscode-uri';
import { isGenerated, isGeneratedFile } from './LanguageIds';
import { createTextDocument } from './Models/TextDocument';
import { DocumentValidator, DocumentValidatorOptions } from './textValidation';
import { determineTextDocumentSettings } from './textValidation/determineTextDocumentSettings';
import { isError } from './util/errors';
import { clean } from './util/util';
import { ValidateTextOptions, ValidationIssue } from './validator';

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
        return spellCheckFullDocument(await resolveDocument(document), options, settings);
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
    settings: CSpellUserSettings
): Promise<SpellCheckFileResult> {
    const { uri, text: content, languageId, locale } = document;
    const doc = createTextDocument({ uri, content, languageId, locale });
    const docValOptions: DocumentValidatorOptions = options;
    const docValidator = new DocumentValidator(doc, docValOptions, settings);
    await docValidator.prepare();

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
        };
    }

    const issues = docValidator.checkDocument();

    const result: SpellCheckFileResult = {
        document,
        options,
        settingsUsed: docValidator.getFinalizedDocSettings(),
        localConfigFilepath: prep?.localConfigFilepath,
        issues,
        checked: docValidator.shouldCheckDocument(),
        errors: undefined,
    };

    return result;
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
    const doc = createTextDocument({
        uri: document.uri,
        content: document.text,
        languageId: document.languageId,
        locale: document.locale,
    });
    return {
        document,
        settings: determineTextDocumentSettings(doc, settings),
    };
}

export function isBinaryDoc(document: Document): boolean {
    return isBinaryFile(URI.parse(document.uri), document.languageId);
}

export function isBinaryFile(filenameUri: URI, languageId?: string | string[]): boolean {
    if (languageId) {
        const ids = normalizeLanguageIds(languageId);
        if (ids.length) return isGenerated(ids);
    }
    const filename = UriUtils.basename(filenameUri);
    return isGeneratedFile(filename);
}

function normalizeLanguageIds(languageId: string | string[]): string[] {
    return (Array.isArray(languageId) ? languageId.join(',') : languageId).split(',').map((s) => s.trim());
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
    return clean({
        uri: URI.file(file).toString(),
        text,
        languageId,
        locale,
    });
}
