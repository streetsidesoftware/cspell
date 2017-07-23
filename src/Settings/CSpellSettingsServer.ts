import * as fs from 'fs';
import * as json from 'comment-json';
import {CSpellUserSettingsWithComments, CSpellUserSettings, RegExpPatternDefinition, Glob} from './CSpellSettingsDef';
import * as path from 'path';
import { normalizePathForDictDefs } from './DictionarySettings';
import * as util from '../util/util';
import * as ConfigStore from 'configstore';
import * as minimatch from 'minimatch';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';
const packageName = 'cspell';
const globalConf = new ConfigStore(packageName);

export const defaultFileName = 'cSpell.json';

const defaultSettings: CSpellUserSettingsWithComments = {
    version: currentSettingsFileVersion,
};

let globalSettings: CSpellUserSettings | undefined;

const cachedFiles = new Map<string, CSpellUserSettings>();

function readJsonFile(file: string): CSpellUserSettings {
    try {
        return json.parse(fs.readFileSync(file).toString());
    }
    catch (err) {
        // console.error('Failed to read "%s"', file);
    }
    return {};
}

function normalizeSettings(settings: CSpellUserSettings, pathToSettings: string) {
    // Fix up dictionaryDefinitions
    const dictionaryDefinitions = normalizePathForDictDefs(settings.dictionaryDefinitions || [], pathToSettings);
    const languageSettings = (settings.languageSettings || [])
        .map(langSetting => ({
            ...langSetting,
            dictionaryDefinitions: normalizePathForDictDefs(langSetting.dictionaryDefinitions || [], pathToSettings)
        }));

    const imports = typeof settings.import === 'string' ? [settings.import] : settings.import || [];

    const fileSettings = {...settings, dictionaryDefinitions, languageSettings};
    const importedSettings: CSpellUserSettings = imports
        .map(name => resolveFilename(name, pathToSettings))
        .map(name => importSettings(name))
        .reduce((a, b) => mergeSettings(a, b), {});
    const finalizeSettings = mergeSettings(importedSettings, fileSettings);
    return finalizeSettings;
}

function importSettings(filename: string): CSpellUserSettings {
    filename = path.resolve(filename);
    if (cachedFiles.has(filename)) {
        return cachedFiles.get(filename)!;
    }
    cachedFiles.set(filename, {}); // add an empty entry to prevent circular references.
    const settings: CSpellUserSettings = readJsonFile(filename);
    const pathToSettings = path.dirname(filename);

    const finalizeSettings = normalizeSettings(settings, pathToSettings);
    cachedFiles.set(filename, finalizeSettings);
    return finalizeSettings;
}

export function readSettings(filename: string, defaultValues: CSpellUserSettingsWithComments = defaultSettings): CSpellUserSettings {
    return mergeSettings(defaultValues, importSettings(filename));
}

export function readSettingsFiles(filenames: string[]): CSpellUserSettings {
    return filenames.map(filename => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}

/**
 * Merges two lists of strings and removes duplicates.  Order is NOT preserved.
 */
function mergeList<T>(left: T[] = [], right: T[] = []) {
    const setOfWords = new Set([...left, ...right]);
    return [...setOfWords.keys()];
}

function replaceIfNotEmpty<T>(left: Array<T> = [], right: Array<T> = []) {
    const filtered = right.filter(a => !!a);
    if (filtered.length) {
        return filtered;
    }
    return left;
}

export function mergeSettings(left: CSpellUserSettings, ...settings: CSpellUserSettings[]): CSpellUserSettings {
    const rawSettings = settings.reduce((left, right) => ({
        ...left,
        ...right,
        words:     mergeList(left.words,     right.words),
        userWords: mergeList(left.userWords, right.userWords),
        flagWords: mergeList(left.flagWords, right.flagWords),
        ignoreWords: mergeList(left.ignoreWords, right.ignoreWords),
        enabledLanguageIds: replaceIfNotEmpty(left.enabledLanguageIds, right.enabledLanguageIds),
        ignoreRegExpList: mergeList(left.ignoreRegExpList, right.ignoreRegExpList),
        patterns: mergeList(left.patterns, right.patterns),
        dictionaryDefinitions: mergeList(left.dictionaryDefinitions, right.dictionaryDefinitions),
        dictionaries: mergeList(left.dictionaries, right.dictionaries),
        languageSettings: mergeList(left.languageSettings, right.languageSettings),
        enabled: right.enabled !== undefined ? right.enabled : left.enabled,
    }), left);
    return util.clean(rawSettings);
}

export function mergeInDocSettings(left: CSpellUserSettings, right: CSpellUserSettings): CSpellUserSettings {
    const merged = {
        ...mergeSettings(left, right),
        includeRegExpList: mergeList(left.includeRegExpList, right.includeRegExpList),
    };
    return merged;
}

export function calcOverrideSettings(settings: CSpellUserSettings, filename: string): CSpellUserSettings {
    const overrides = settings.overrides || [];

    const result = overrides
        .filter(override => checkFilenameMatchesGlob(filename, override.filename))
        .reduce((settings, override) => mergeSettings(settings, override), settings);
    return result;
}

export function finalizeSettings(settings: CSpellUserSettings): CSpellUserSettings {
    // apply patterns to any RegExpLists.

    return {
        ...settings,
        ignoreRegExpList: applyPatterns(settings.ignoreRegExpList, settings.patterns),
        includeRegExpList: applyPatterns(settings.includeRegExpList, settings.patterns),
    };
}

function applyPatterns(regExpList: (string | RegExp)[] = [], patterns: RegExpPatternDefinition[] = []): (string|RegExp)[] {
    const patternMap = new Map(patterns
        .map(def => [def.name.toLowerCase(), def.pattern] as [string, string|RegExp])
    );

    return regExpList.map(p => patternMap.get(p.toString().toLowerCase()) || p);
}

const testNodeModules = /^node_modules\//;

function resolveFilename(filename: string, relativeTo: string) {
    if (testNodeModules.test(filename)) {
        filename = require.resolve(filename.replace(testNodeModules, ''));
    }
    return path.isAbsolute(filename) ? filename : path.resolve(relativeTo, filename);
}

export function getGlobalSettings(): CSpellUserSettings {
    if (!globalSettings) {
        globalSettings = normalizeSettings(globalConf.all || {}, __dirname);
    }
    return globalSettings!;
}

export function getCachedFileSize() {
    return cachedFiles.size;
}

export function clearCachedFiles() {
    cachedFiles.clear();
}

export function checkFilenameMatchesGlob(filename: string, globs: Glob | Glob[]): boolean {
    if (typeof globs === 'string') {
        globs = [globs];
    }

    const matches = globs
        .filter(g => minimatch(filename, g, { matchBase: true }));
    return matches.length > 0;
}
