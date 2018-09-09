import * as fs from 'fs';
import * as json from 'comment-json';
import {
    CSpellUserSettingsWithComments,
    CSpellSettings,
    RegExpPatternDefinition,
    Glob,
    Source,
    LanguageSetting,
} from './CSpellSettingsDef';
import * as path from 'path';
import { normalizePathForDictDefs } from './DictionarySettings';
import * as util from '../util/util';
import * as ConfigStore from 'configstore';
import * as minimatch from 'minimatch';
import { finalize } from 'rxjs/operators';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';
const packageName = 'cspell';

export const defaultFileName = 'cSpell.json';

const defaultSettings: CSpellUserSettingsWithComments = {
    id: 'default',
    name: 'default',
    version: currentSettingsFileVersion,
};

let globalSettings: CSpellSettings | undefined;

const cachedFiles = new Map<string, CSpellSettings>();

function readJsonFile(file: string): CSpellSettings {
    try {
        return json.parse(fs.readFileSync(file).toString());
    }
    catch (err) {
        console.error('Failed to read "%s": %s', file, err);
    }
    return {};
}

function normalizeSettings(settings: CSpellSettings, pathToSettings: string): CSpellSettings {
    // Fix up dictionaryDefinitions
    const dictionaryDefinitions = normalizePathForDictDefs(settings.dictionaryDefinitions || [], pathToSettings);
    const languageSettings = (settings.languageSettings || [])
        .map(langSetting => ({
            ...langSetting,
            dictionaryDefinitions: normalizePathForDictDefs(langSetting.dictionaryDefinitions || [], pathToSettings)
        }));

    const imports = typeof settings.import === 'string' ? [settings.import] : settings.import || [];

    const fileSettings = {...settings, dictionaryDefinitions, languageSettings};
    if (!imports.length) {
        return fileSettings;
    }
    const importedSettings: CSpellSettings = imports
        .map(name => resolveFilename(name, pathToSettings))
        .map(name => importSettings(name))
        .reduce((a, b) => mergeSettings(a, b));
    const finalizeSettings = mergeSettings(importedSettings, fileSettings);
    finalizeSettings.name = settings.name || finalizeSettings.name || '';
    finalizeSettings.id = settings.id || finalizeSettings.id || '';
    return finalizeSettings;
}

function importSettings(filename: string, defaultValues: CSpellUserSettingsWithComments | CSpellSettings = defaultSettings): CSpellSettings {
    filename = path.resolve(filename);
    if (cachedFiles.has(filename)) {
        return cachedFiles.get(filename)!;
    }
    const id = [path.basename(path.dirname(filename)), path.basename(filename)].join('/');
    const finalizeSettings: CSpellSettings = { id };
    cachedFiles.set(filename, finalizeSettings); // add an empty entry to prevent circular references.
    const settings: CSpellSettings = {...defaultValues as CSpellSettings, id, ...readJsonFile(filename)};
    const pathToSettings = path.dirname(filename);

    Object.assign(finalizeSettings, normalizeSettings(settings, pathToSettings));
    const finalizeSrc = finalizeSettings.source || {};
    const name = finalize.name || path.basename(filename);
    finalizeSettings.source = { ...finalizeSrc, filename, name };
    cachedFiles.set(filename, finalizeSettings);
    return finalizeSettings;
}

export function readSettings(filename: string, defaultValues?: CSpellUserSettingsWithComments): CSpellSettings {
    return importSettings(filename, defaultValues);
}

export function readSettingsFiles(filenames: string[]): CSpellSettings {
    return filenames.map(filename => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}

/**
 * Merges two lists of strings and removes duplicates.  Order is NOT preserved.
 */
function mergeList<T>(left: T[] = [], right: T[] = []) {
    const setOfWords = new Set([...left, ...right]);
    return [...setOfWords.keys()];
}

function tagLanguageSettings(tag: string, settings: LanguageSetting[] = []): LanguageSetting[] {
    return settings.map(s => ({
        id: tag + '.' + (s.id || s.local || s.languageId),
        ...s
    }));
}

function replaceIfNotEmpty<T>(left: Array<T> = [], right: Array<T> = []) {
    const filtered = right.filter(a => !!a);
    if (filtered.length) {
        return filtered;
    }
    return left;
}

export function mergeSettings(left: CSpellSettings, ...settings: CSpellSettings[]): CSpellSettings {
    const rawSettings = settings.reduce(merge, left);
    return util.clean(rawSettings);
}

function isEmpty(obj: any) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function merge(left: CSpellSettings, right: CSpellSettings): CSpellSettings {
    if (left === right) {
        return left;
    }
    if (isEmpty(right)) {
        return left;
    }
    if (isEmpty(left)) {
        return right;
    }
    if (hasLeftAncestor(right, left)) {
        return right;
    }
    if (hasRightAncestor(left, right)) {
        return left;
    }
    const leftId = left.id || left.languageId || '';
    const rightId = right.id || right.languageId || '';

    const includeRegExpList = takeRightThenLeft(left.includeRegExpList, right.includeRegExpList);

    const optionals = includeRegExpList.length ? { includeRegExpList } : {};

    return {
        ...left,
        ...right,
        ...optionals,
        id: [leftId, rightId].join('|'),
        name: [left.name || '', right.name || ''].join('|'),
        words:     mergeList(left.words,     right.words),
        userWords: mergeList(left.userWords, right.userWords),
        flagWords: mergeList(left.flagWords, right.flagWords),
        ignoreWords: mergeList(left.ignoreWords, right.ignoreWords),
        enabledLanguageIds: replaceIfNotEmpty(left.enabledLanguageIds, right.enabledLanguageIds),
        ignoreRegExpList: mergeList(left.ignoreRegExpList, right.ignoreRegExpList),
        patterns: mergeList(left.patterns, right.patterns),
        dictionaryDefinitions: mergeList(left.dictionaryDefinitions, right.dictionaryDefinitions),
        dictionaries: mergeList(left.dictionaries, right.dictionaries),
        languageSettings: mergeList(tagLanguageSettings(leftId, left.languageSettings), tagLanguageSettings(rightId, right.languageSettings)),
        enabled: right.enabled !== undefined ? right.enabled : left.enabled,
        source: mergeSources(left, right),
    };
}

function hasLeftAncestor(s: CSpellSettings, left: CSpellSettings): boolean {
    return hasAncestor(s, left, 0);
}

function hasRightAncestor(s: CSpellSettings, right: CSpellSettings): boolean {
    return hasAncestor(s, right, 1);
}

function hasAncestor(s: CSpellSettings, ancestor: CSpellSettings, side: number): boolean {
    return s.source
        && s.source.sources
        && s.source.sources[side]
        && (s.source.sources[side] === ancestor || hasAncestor(s.source.sources[side], ancestor, side))
        || false;
}

export function mergeInDocSettings(left: CSpellSettings, right: CSpellSettings): CSpellSettings {
    const merged = {
        ...mergeSettings(left, right),
        includeRegExpList: mergeList(left.includeRegExpList, right.includeRegExpList),
    };
    return merged;
}

function  takeRightThenLeft<T>(left: T[] = [], right: T[] = []) {
    if (right.length) {
        return right;
    }
    return left;
}

export function calcOverrideSettings(settings: CSpellSettings, filename: string): CSpellSettings {
    const overrides = settings.overrides || [];

    const result = overrides
        .filter(override => checkFilenameMatchesGlob(filename, override.filename))
        .reduce((settings, override) => mergeSettings(settings, override), settings);
    return result;
}

export function finalizeSettings(settings: CSpellSettings): CSpellSettings {
    // apply patterns to any RegExpLists.

    const finalized = {
        ...settings,
        ignoreRegExpList: applyPatterns(settings.ignoreRegExpList, settings.patterns),
        includeRegExpList: applyPatterns(settings.includeRegExpList, settings.patterns),
    };

    finalized.name = 'Finalized ' + (finalized.name || '');
    finalized.source = { name: settings.name || 'src', sources: [settings] };

    return finalized;
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

export function getGlobalSettings(): CSpellSettings {
    if (!globalSettings) {
        const globalConf = {};

        try {
            const cfgStore = new ConfigStore(packageName);
            Object.assign(globalConf, cfgStore.all);
        } catch (error) {
            console.log(error);
        }

        globalSettings = {
            id: 'global_config',
            ...normalizeSettings(globalConf || {}, __dirname)
        };
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

function mergeSources(left: CSpellSettings, right: CSpellSettings): Source {
    const { source: a = { name: 'left'} } = left;
    const { source: b = { name: 'right'} } = right;
    return {
        name: [left.name || a.name, right.name || b.name].join('|'),
        sources: [left, right],
    };
}

/**
 * Return a list of Setting Sources used to create this Setting.
 * @param settings settings to search
 */
export function getSources(settings: CSpellSettings): CSpellSettings[] {
    if (!settings.source || !settings.source.sources || !settings.source.sources.length) {
        return [settings];
    }
    const left = settings.source.sources[0];
    const right = settings.source.sources[1];
    return right ? getSources(left).concat(getSources(right)) : getSources(left);
}
