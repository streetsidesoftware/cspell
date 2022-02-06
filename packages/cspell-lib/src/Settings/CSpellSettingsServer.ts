import * as fs from 'fs';
import * as json from 'comment-json';
import {
    RegExpPatternDefinition,
    Glob,
    Source,
    LanguageSetting,
    Pattern,
    CSpellSettingsWithSourceTrace,
    ImportFileRef,
} from './CSpellSettingsDef';
import * as path from 'path';
import { normalizePathForDictDefs } from './DictionarySettings';
import * as util from '../util/util';
import ConfigStore from 'configstore';
import minimatch from 'minimatch';
import { resolveFile } from '../util/resolveFile';

const currentSettingsFileVersion = '0.1';

export const sectionCSpell = 'cSpell';
const packageName = 'cspell';

export const defaultFileName = 'cSpell.json';

type CSpellSettings = CSpellSettingsWithSourceTrace;

const defaultSettings: CSpellSettings = {
    id: 'default',
    name: 'default',
    version: currentSettingsFileVersion,
};

let globalSettings: CSpellSettings | undefined;

const cachedFiles = new Map<string, CSpellSettings>();

function readJsonFile(fileRef: ImportFileRef): CSpellSettings {
    const { filename } = fileRef;
    let s: CSpellSettings = {};
    try {
        const p = json.parse(fs.readFileSync(filename).toString());
        if (!p || typeof p !== 'object' || Array.isArray(p)) throw 'bad config';
        s = p;
    } catch (err) {
        fileRef.error = new Error(`Failed to read config file: "${filename}"`);
    }
    s.__importRef = fileRef;
    return s;
}

function normalizeSettings(settings: CSpellSettings, pathToSettings: string): CSpellSettings {
    // Fix up dictionaryDefinitions
    const dictionaryDefinitions = normalizePathForDictDefs(settings.dictionaryDefinitions || [], pathToSettings);
    const languageSettings = (settings.languageSettings || []).map((langSetting) => ({
        ...langSetting,
        dictionaryDefinitions: normalizePathForDictDefs(langSetting.dictionaryDefinitions || [], pathToSettings),
    }));

    const imports = typeof settings.import === 'string' ? [settings.import] : settings.import || [];
    const source: Source = settings.source || { name: settings.name || settings.id || pathToSettings };

    const fileSettings = { ...settings, dictionaryDefinitions, languageSettings };
    if (!imports.length) {
        return fileSettings;
    }
    const importedSettings: CSpellSettings = imports
        .map((name) => resolveFilename(name, pathToSettings))
        .map((ref) => ((ref.sources = [source]), ref))
        .map((ref) => importSettings(ref))
        .reduce((a, b) => mergeSettings(a, b));
    const finalizeSettings = mergeSettings(importedSettings, fileSettings);
    finalizeSettings.name = settings.name || finalizeSettings.name || '';
    finalizeSettings.id = settings.id || finalizeSettings.id || '';
    return finalizeSettings;
}

function mergeSourceList(orig: Source[], append: Source[] | undefined): Source[] {
    const collection = new Map(orig.map((s) => [s.name + (s.filename || ''), s]));

    for (const s of append || []) {
        const key = s.name + (s.filename || '');
        if (!collection.has(key)) {
            collection.set(key, s);
        }
    }

    return [...collection.values()];
}

function importSettings(fileRef: ImportFileRef, defaultValues: CSpellSettings = defaultSettings): CSpellSettings {
    let { filename } = fileRef;
    filename = path.resolve(filename);
    const importRef: ImportFileRef = { ...fileRef, filename };
    const cached = cachedFiles.get(filename);
    if (cached) {
        const cachedImportRef = cached.__importRef || importRef;
        cachedImportRef.sources = mergeSourceList(cachedImportRef.sources || [], importRef.sources);
        cached.__importRef = cachedImportRef;
        return cached;
    }
    const id = [path.basename(path.dirname(filename)), path.basename(filename)].join('/');
    const finalizeSettings: CSpellSettings = { id };
    cachedFiles.set(filename, finalizeSettings); // add an empty entry to prevent circular references.
    const settings: CSpellSettings = { ...defaultValues, id, ...readJsonFile(importRef) };
    const pathToSettings = path.dirname(filename);

    Object.assign(finalizeSettings, normalizeSettings(settings, pathToSettings));
    const finalizeSrc: Source = { name: path.basename(filename), ...finalizeSettings.source };
    finalizeSettings.source = { ...finalizeSrc, filename };
    cachedFiles.set(filename, finalizeSettings);
    return finalizeSettings;
}

export function readSettings(filename: string, defaultValues?: CSpellSettings): CSpellSettings {
    return importSettings({ filename }, defaultValues);
}

export function readSettingsFiles(filenames: string[]): CSpellSettings {
    return filenames.map((filename) => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}

/**
 * Merges two lists of strings and removes duplicates.  Order is NOT preserved.
 */
function mergeList<T>(left: T[] = [], right: T[] = []) {
    const setOfWords = new Set([...left, ...right]);
    return [...setOfWords.keys()];
}

function tagLanguageSettings(tag: string, settings: LanguageSetting[] = []): LanguageSetting[] {
    return settings.map((s) => ({
        id: tag + '.' + (s.id || s.local || s.languageId),
        ...s,
    }));
}

function replaceIfNotEmpty<T>(left: Array<T> = [], right: Array<T> = []) {
    const filtered = right.filter((a) => !!a);
    if (filtered.length) {
        return filtered;
    }
    return left;
}

export function mergeSettings(left: CSpellSettings, ...settings: CSpellSettings[]): CSpellSettings {
    const rawSettings = settings.reduce(merge, left);
    return util.clean(rawSettings);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const settings: CSpellSettings = {
        ...left,
        ...right,
        ...optionals,
        id: [leftId, rightId].join('|'),
        name: [left.name || '', right.name || ''].join('|'),
        words: mergeList(left.words, right.words),
        userWords: mergeList(left.userWords, right.userWords),
        flagWords: mergeList(left.flagWords, right.flagWords),
        ignoreWords: mergeList(left.ignoreWords, right.ignoreWords),
        enabledLanguageIds: replaceIfNotEmpty(left.enabledLanguageIds, right.enabledLanguageIds),
        ignoreRegExpList: mergeList(left.ignoreRegExpList, right.ignoreRegExpList),
        patterns: mergeList(left.patterns, right.patterns),
        dictionaryDefinitions: mergeList(left.dictionaryDefinitions, right.dictionaryDefinitions),
        dictionaries: mergeList(left.dictionaries, right.dictionaries),
        languageSettings: mergeList(
            tagLanguageSettings(leftId, left.languageSettings),
            tagLanguageSettings(rightId, right.languageSettings)
        ),
        enabled: right.enabled !== undefined ? right.enabled : left.enabled,
        source: mergeSources(left, right),
        __imports: mergeImportRefs(left, right),
        __importRef: undefined,
    };
    return settings;
}

function hasLeftAncestor(s: CSpellSettings, left: CSpellSettings): boolean {
    return hasAncestor(s, left, 0);
}

function hasRightAncestor(s: CSpellSettings, right: CSpellSettings): boolean {
    return hasAncestor(s, right, 1);
}

function hasAncestor(s: CSpellSettings, ancestor: CSpellSettings, side: number): boolean {
    if (s.source) {
        return (
            (s.source &&
                s.source.sources &&
                s.source.sources[side] &&
                (s.source.sources[side] === ancestor || hasAncestor(s.source.sources[side], ancestor, side))) ||
            false
        );
    }
    return false;
}

export function mergeInDocSettings(left: CSpellSettings, right: CSpellSettings): CSpellSettings {
    const merged = {
        ...mergeSettings(left, right),
        includeRegExpList: mergeList(left.includeRegExpList, right.includeRegExpList),
    };
    return merged;
}

function takeRightThenLeft<T>(left: T[] = [], right: T[] = []) {
    if (right.length) {
        return right;
    }
    return left;
}

export function calcOverrideSettings(settings: CSpellSettings, filename: string): CSpellSettings {
    const overrides = settings.overrides || [];

    const result = overrides
        .filter((override) => checkFilenameMatchesGlob(filename, override.filename))
        .reduce((settings, override) => mergeSettings(settings, override), settings);
    return result;
}

export function finalizeSettings(settings: CSpellSettings): CSpellSettings {
    // apply patterns to any RegExpLists.

    const finalized: CSpellSettings = {
        ...settings,
        ignoreRegExpList: applyPatterns(settings.ignoreRegExpList, settings.patterns),
        includeRegExpList: applyPatterns(settings.includeRegExpList, settings.patterns),
    };

    finalized.name = 'Finalized ' + (finalized.name || '');
    finalized.source = { name: settings.name || 'src', sources: [settings] };

    return finalized;
}

function applyPatterns(
    regExpList: (string | RegExp)[] = [],
    patternDefinitions: RegExpPatternDefinition[] = []
): (string | RegExp)[] {
    const patternMap = new Map(patternDefinitions.map((def) => [def.name.toLowerCase(), def.pattern]));

    function* flatten(patterns: (Pattern | Pattern[])[]): IterableIterator<Pattern> {
        for (const pattern of patterns) {
            if (Array.isArray(pattern)) {
                yield* flatten(pattern);
            } else {
                yield pattern;
            }
        }
    }
    const patternList = regExpList.map((p) => patternMap.get(p.toString().toLowerCase()) || p);

    return [...flatten(patternList)];
}

function resolveFilename(filename: string, relativeTo: string): ImportFileRef {
    const r = resolveFile(filename, relativeTo);

    return {
        filename: r.filename,
        error: r.found ? undefined : new Error(`Failed to resolve file: "${filename}"`),
    };
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
            ...normalizeSettings(globalConf || {}, __dirname),
        };
    }
    return globalSettings;
}

export function getCachedFileSize(): number {
    return cachedFiles.size;
}

export function clearCachedFiles(): void {
    cachedFiles.clear();
}

export function checkFilenameMatchesGlob(filename: string, globs: Glob | Glob[]): boolean {
    if (typeof globs === 'string') {
        globs = [globs];
    }

    const matches = globs.filter((g) => minimatch(filename, g, { matchBase: true }));
    return matches.length > 0;
}

function mergeSources(left: CSpellSettings, right: CSpellSettings): Source {
    const { source: a = { name: 'left' } } = left;
    const { source: b = { name: 'right' } } = right;
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
    if (!settings.source?.sources?.length) {
        return [settings];
    }
    const left = settings.source.sources[0];
    const right = settings.source.sources[1];
    return right ? getSources(left).concat(getSources(right)) : getSources(left);
}

type Imports = CSpellSettings['__imports'];

function mergeImportRefs(left: CSpellSettings, right: CSpellSettings): Imports {
    const imports = new Map(left.__imports || []);
    if (left.__importRef) {
        imports.set(left.__importRef.filename, left.__importRef);
    }
    if (right.__importRef) {
        imports.set(right.__importRef.filename, right.__importRef);
    }
    const rightImports = right.__imports?.values() || [];
    for (const ref of rightImports) {
        imports.set(ref.filename, ref);
    }
    return imports.size ? imports : undefined;
}

export interface ImportFileRefWithError extends ImportFileRef {
    error: Error;
}

function isImportFileRefWithError(ref: ImportFileRef): ref is ImportFileRefWithError {
    return !!ref.error;
}

export function extractImportErrors(settings: CSpellSettings): ImportFileRefWithError[] {
    const imports = mergeImportRefs(settings, {});
    return !imports ? [] : [...imports.values()].filter(isImportFileRefWithError);
}
