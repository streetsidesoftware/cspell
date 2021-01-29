import { CSpellSettingsWithSourceTrace, CSpellUserSettings } from '@cspell/cspell-types';
import { readFile } from 'fs-extra';
import { URI } from 'vscode-uri';
import { getLanguagesForExt } from './LanguageIds';
import {
    calcOverrideSettings,
    getDefaultSettings,
    getGlobalSettings,
    mergeSettings,
    searchForConfig,
} from './Settings';
import { validateText, ValidationIssue } from './validator';
import * as path from 'path';
import { combineTextAndLanguageSettings } from './Settings/TextDocumentSettings';

export interface SpellCheckFileOptions {
    configFile?: string;
    encoding?: BufferEncoding;
}

export interface SpellCheckFileResult {
    document: Document;
    settingsUsed: CSpellSettingsWithSourceTrace;
    options: SpellCheckFileOptions;
    issues: ValidationIssue[];
    checked: boolean;
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
    const [localConfig, document] = await Promise.all([searchForConfig(file), readDocument(file, options.encoding)]);
    const config = localConfig ? mergeSettings(settings, localConfig) : settings;
    const docSettings = determineDocumentSettings(document, config);

    const shouldCheck = docSettings.settings.enabled ?? true;

    const issues = shouldCheck ? await validateText(document.text, docSettings.settings) : [];

    const result: SpellCheckFileResult = {
        document,
        options,
        settingsUsed: docSettings.settings,
        issues,
        checked: shouldCheck,
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

function determineDocumentSettings(document: Document, settings: CSpellUserSettings): DetermineDocumentSettingsResult {
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
