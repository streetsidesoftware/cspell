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
    document: Document;
    settingsUsed: CSpellSettingsWithSourceTrace;
    localConfigFilepath: string | undefined;
    options: SpellCheckFileOptions;
    issues: ValidationIssue[];
    checked: boolean;
    errors: Error[] | undefined;
}

const defaultEncoding: BufferEncoding = 'utf8';

interface Document {
    uri: URI;
    text: string;
}

export async function spellCheckFile(
    file: string,
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
        ? catchError(searchForConfig(file))
        : undefined;
    const [localConfig, document] = await Promise.all([pLocalConfig, catchError(readDocument(file, options.encoding))]);

    addPossibleError(localConfig?.__importRef?.error);

    if (!document || errors.length) {
        return {
            document: { uri: document?.uri ?? URI.file(file), text: document?.text ?? '' },
            options,
            settingsUsed: localConfig || settings,
            localConfigFilepath: localConfig?.__importRef?.filename,
            issues: [],
            checked: false,
            errors,
        };
    }

    const config = localConfig ? mergeSettings(settings, localConfig) : settings;
    const docSettings = determineDocumentSettings(document, config);

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

async function readDocument(filename: string, encoding: BufferEncoding = defaultEncoding): Promise<Document> {
    const text = await readFile(filename, encoding);
    const uri = URI.file(filename);

    return {
        uri,
        text,
    };
}

interface DetermineDocumentSettingsResult {
    document: Document;
    settings: CSpellUserSettings;
}

export function determineDocumentSettings(
    document: Document,
    settings: CSpellUserSettings
): DetermineDocumentSettingsResult {
    const filename = document.uri.fsPath;
    const ext = path.extname(filename);
    const fileOverrideSettings = calcOverrideSettings(settings, path.resolve(filename));
    const fileSettings = mergeSettings(getDefaultSettings(), getGlobalSettings(), fileOverrideSettings);
    const languageIds = settings.languageId ? [settings.languageId] : getLanguagesForExt(ext);
    const config = combineTextAndLanguageSettings(fileSettings, document.text, languageIds);
    return {
        document,
        settings: config,
    };
}
