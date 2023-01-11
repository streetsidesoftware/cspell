import type {
    AdvancedCSpellSettingsWithSourceTrace,
    CSpellSettingsWithSourceTrace,
    CSpellUserSettings,
    Glob,
    ImportFileRef,
    Parser,
    Plugin,
    Source,
} from '@cspell/cspell-types';
import assert from 'assert';
import { GlobMatcher } from 'cspell-glob';
import * as path from 'path';

import type { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef';
import { createCSpellSettingsInternal as csi, isCSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import type { OptionalOrUndefined } from '../util/types';
import * as util from '../util/util';
import { configSettingsFileVersion0_1, ENV_CSPELL_GLOB_ROOT } from './constants';
import { calcDictionaryDefsToLoad, mapDictDefsToInternal } from './DictionarySettings';
import { resolvePatterns } from './patterns';

type CSpellSettingsWST = AdvancedCSpellSettingsWithSourceTrace;
type CSpellSettingsWSTO = OptionalOrUndefined<AdvancedCSpellSettingsWithSourceTrace>;
type CSpellSettingsI = CSpellSettingsInternal;

function _unique<T>(a: T[]): T[] {
    return [...new Set(a)];
}

/**
 * Merges two lists and removes duplicates.  Order is NOT preserved.
 */
function mergeListUnique(left: undefined, right: undefined): undefined;
function mergeListUnique<T>(left: T[], right: T[]): T[];
function mergeListUnique<T>(left: undefined, right: T[]): T[];
function mergeListUnique<T>(left: T[], right: undefined): T[];
function mergeListUnique<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
function mergeListUnique<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (left === undefined) return right;
    if (right === undefined) return left;
    if (!right.length) return left;
    if (!left.length) return right;
    return _unique([...left, ...right]);
}

/**
 * Merges two lists.
 * Order is preserved.
 */
function mergeList(left: undefined, right: undefined): undefined;
function mergeList<T>(left: T[], right: T[]): T[];
function mergeList<T>(left: undefined, right: T[]): T[];
function mergeList<T>(left: T[], right: undefined): T[];
function mergeList<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
function mergeList<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (left === undefined) return right;
    if (right === undefined) return left;
    if (!left.length) return right;
    if (!right.length) return left;
    return left.concat(right);
}

const emptyWords: string[] = [];
Object.freeze(emptyWords);

/**
 * Merges two lists of words.
 * Order is preserved.
 */
function mergeWordsCached(left: undefined, right: undefined): undefined;
function mergeWordsCached(left: string[], right: string[]): string[];
function mergeWordsCached(left: undefined, right: string[]): string[];
function mergeWordsCached(left: string[], right: undefined): string[];
function mergeWordsCached(left: string[] | undefined, right: string[] | undefined): string[] | undefined;
function mergeWordsCached(left: string[] | undefined, right: string[] | undefined): string[] | undefined {
    if (left === undefined) return !right || right.length ? right : emptyWords;
    if (right === undefined) return !left || left.length ? left : emptyWords;
    if (!left.length) return !right || right.length ? right : emptyWords;
    if (!right.length) return !left || left.length ? left : emptyWords;

    return left.concat(right);
}

function mergeObjects(left: undefined, right: undefined): undefined;
function mergeObjects<T>(left: T, right: undefined): T;
function mergeObjects<T>(left: T, right: T): T;
function mergeObjects<T>(left: undefined, right: T): T;
function mergeObjects<T>(left?: T, right?: T): T | undefined {
    if (left === undefined) return right;
    if (right === undefined) return left;
    return { ...left, ...right };
}

function replaceIfNotEmpty<T>(left: Array<T> = [], right: Array<T> = []) {
    const filtered = right.filter((a) => !!a);
    if (filtered.length) {
        return filtered;
    }
    return left;
}

export function mergeSettings(
    left: CSpellSettingsWSTO | CSpellSettingsI,
    ...settings: (CSpellSettingsWSTO | CSpellSettingsI | undefined)[]
): CSpellSettingsI {
    const rawSettings = settings.filter((a) => !!a).reduce<CSpellSettingsI>(merge, toInternalSettings(left));
    return util.clean(rawSettings);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function isEmpty(obj: Object) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function merge(
    left: CSpellSettingsWSTO | CSpellSettingsI,
    right: CSpellSettingsWSTO | CSpellSettingsI
): CSpellSettingsI {
    const _left = toInternalSettings(left);
    const _right = toInternalSettings(right);
    if (left === right) {
        return _left;
    }
    if (isEmpty(right)) {
        return _left;
    }
    if (isEmpty(left)) {
        return _right;
    }
    if (isLeftAncestorOfRight(_left, _right)) {
        return _right;
    }
    if (doesLeftHaveRightAncestor(_left, _right)) {
        return _left;
    }
    const leftId = _left.id || _left.languageId || '';
    const rightId = _right.id || _right.languageId || '';

    const includeRegExpList = takeRightOtherwiseLeft(_left.includeRegExpList, _right.includeRegExpList);

    const optionals = includeRegExpList?.length ? { includeRegExpList } : {};
    const version = max(_left.version, _right.version);

    const settings = csi({
        ..._left,
        ..._right,
        ...optionals,
        version,
        id: [leftId, rightId].join('|'),
        name: [_left.name || '', _right.name || ''].join('|'),
        words: mergeWordsCached(_left.words, _right.words),
        userWords: mergeWordsCached(_left.userWords, _right.userWords),
        flagWords: mergeWordsCached(_left.flagWords, _right.flagWords),
        ignoreWords: mergeWordsCached(_left.ignoreWords, _right.ignoreWords),
        enabledLanguageIds: replaceIfNotEmpty(_left.enabledLanguageIds, _right.enabledLanguageIds),
        enableFiletypes: mergeList(_left.enableFiletypes, _right.enableFiletypes),
        ignoreRegExpList: mergeListUnique(_left.ignoreRegExpList, _right.ignoreRegExpList),
        patterns: mergeListUnique(_left.patterns, _right.patterns),
        dictionaryDefinitions: mergeListUnique(_left.dictionaryDefinitions, _right.dictionaryDefinitions),
        dictionaries: mergeListUnique(_left.dictionaries, _right.dictionaries),
        noSuggestDictionaries: mergeListUnique(_left.noSuggestDictionaries, _right.noSuggestDictionaries),
        languageSettings: mergeList(_left.languageSettings, _right.languageSettings),
        enabled: _right.enabled !== undefined ? _right.enabled : _left.enabled,
        files: mergeListUnique(_left.files, _right.files),
        ignorePaths: versionBasedMergeList(_left.ignorePaths, _right.ignorePaths, version),
        overrides: versionBasedMergeList(_left.overrides, _right.overrides, version),
        features: mergeObjects(_left.features, _right.features),
        source: mergeSources(_left, _right),
        description: undefined,
        globRoot: undefined,
        import: undefined,
        plugins: mergeList(_left.plugins, _right.plugins),
        __imports: mergeImportRefs(_left, _right),
        __importRef: undefined,
    });
    return settings;
}

function versionBasedMergeList<T>(
    left: T[] | undefined,
    right: T[] | undefined,
    version: CSpellUserSettings['version']
): T[] | undefined {
    if (version === configSettingsFileVersion0_1) {
        return takeRightOtherwiseLeft(left, right);
    }
    return mergeListUnique(left, right);
}

/**
 * Check to see if left is a left ancestor of right.
 * If that is the case, merging is not necessary:
 * @param left - setting on the left side of a merge
 * @param right - setting on the right side of a merge
 */
function isLeftAncestorOfRight(left: CSpellSettingsWSTO, right: CSpellSettingsWSTO): boolean {
    return hasAncestor(right, left, 0);
}

/**
 * Check to see if left has right as an ancestor to the right.
 * If that is the case, merging is not necessary:
 * @param left - setting on the left side of a merge
 * @param right - setting on the right side of a merge
 */
function doesLeftHaveRightAncestor(left: CSpellSettingsWSTO, right: CSpellSettingsWSTO): boolean {
    return hasAncestor(left, right, 1);
}

function hasAncestor(s: CSpellSettingsWSTO, ancestor: CSpellSettingsWSTO, side: number): boolean {
    const sources = s.source?.sources;
    if (!sources) return false;
    // calc the first or last index of the source array.
    const i = side ? sources.length - 1 : 0;
    const src = sources[i];
    return src === ancestor || (src && hasAncestor(src, ancestor, side)) || false;
}

export function mergeInDocSettings(left: CSpellSettingsWSTO, right: CSpellSettingsWSTO): CSpellSettingsWST {
    const merged = {
        ...mergeSettings(left, right),
        includeRegExpList: mergeListUnique(left.includeRegExpList, right.includeRegExpList),
    };
    return util.clean(merged);
}

/**
 * If right is non-empty return right, otherwise return left.
 * @param left - left hand values
 * @param right - right hand values
 */
function takeRightOtherwiseLeft(left: undefined, right: undefined): undefined;
function takeRightOtherwiseLeft<T>(left: T[], right: undefined): T[];
function takeRightOtherwiseLeft<T>(left: undefined, right: T[]): T[];
function takeRightOtherwiseLeft<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
function takeRightOtherwiseLeft<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (right?.length) {
        return right;
    }
    return left || right;
}

export function calcOverrideSettings(settings: CSpellSettingsWSTO, filename: string): CSpellSettingsI {
    const _settings = toInternalSettings(settings);
    const overrides = _settings.overrides || [];

    const result = overrides
        .filter((override) => checkFilenameMatchesGlob(filename, override.filename))
        .reduce((settings, override) => mergeSettings(settings, override), _settings);
    return result;
}

/**
 *
 * @param settings - settings to finalize
 * @returns settings where all globs and file paths have been resolved.
 */
export function finalizeSettings(settings: CSpellSettingsWSTO | CSpellSettingsI): CSpellSettingsInternalFinalized {
    return _finalizeSettings(toInternalSettings(settings));
}

function _finalizeSettings(settings: CSpellSettingsI): CSpellSettingsInternalFinalized {
    // apply patterns to any RegExpLists.

    const finalized: CSpellSettingsInternalFinalized = {
        ...settings,
        finalized: true,
        ignoreRegExpList: resolvePatterns(settings.ignoreRegExpList, settings.patterns),
        includeRegExpList: resolvePatterns(settings.includeRegExpList, settings.patterns),
        parserFn: resolveParser(settings),
    };

    finalized.name = 'Finalized ' + (finalized.name || '');
    finalized.source = { name: settings.name || 'src', sources: [settings] };
    return finalized;
}

export function toInternalSettings(settings: undefined): undefined;
export function toInternalSettings(settings: CSpellSettingsI | CSpellSettingsWSTO): CSpellSettingsI;
export function toInternalSettings(settings?: CSpellSettingsI | CSpellSettingsWSTO): CSpellSettingsI | undefined;
export function toInternalSettings(settings?: CSpellSettingsI | CSpellSettingsWSTO): CSpellSettingsI | undefined {
    if (settings === undefined) return undefined;
    if (isCSpellSettingsInternal(settings)) return settings;

    const { dictionaryDefinitions: defs, ...rest } = settings;

    const dictionaryDefinitions = mapDictDefsToInternal(
        defs,
        filenameToDirectory(settings.source?.filename) || resolveCwd()
    );
    const setting = dictionaryDefinitions ? { ...rest, dictionaryDefinitions } : rest;
    return csi(setting);
}

function filenameToDirectory(filename: string | undefined): string | undefined {
    return filename ? path.dirname(filename) : undefined;
}

/**
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 * @deprecated true
 * @deprecationMessage No longer actively supported. Use package: `cspell-glob`.
 */
export function checkFilenameMatchesGlob(filename: string, globs: Glob | Glob[]): boolean {
    const m = new GlobMatcher(globs);
    return m.match(filename);
}

function mergeSources(left: CSpellSettingsWSTO, right: CSpellSettingsWSTO): Source {
    const { source: a = { name: 'left' } } = left;
    const { source: b = { name: 'right' } } = right;
    return {
        name: [left.name || a.name, right.name || b.name].join('|'),
        sources: [left as CSpellSettingsWithSourceTrace, right as CSpellSettingsWithSourceTrace],
    };
}

function max(a: undefined, b: undefined): undefined;
function max<T>(a: T, b: undefined): T;
function max<T>(a: undefined, b: T): T;
function max<T>(a: T | undefined, b: T | undefined): T | undefined;
function max<T>(a: T | undefined, b: T | undefined): T | undefined {
    if (a === undefined || a === null) return b;
    if (b === undefined || b === null) return a;
    return a > b ? a : b;
}

/**
 * Return a list of Setting Sources used to create this Setting.
 * @param settings the settings to search
 */
export function getSources(settings: CSpellSettingsWSTO): CSpellSettingsWSTO[] {
    const visited = new Set<CSpellSettingsWSTO>();
    const sources: CSpellSettingsWSTO[] = [];

    function _walkSourcesTree(settings: CSpellSettingsWSTO | undefined): void {
        if (!settings || visited.has(settings)) return;
        visited.add(settings);
        if (!settings.source?.sources?.length) {
            sources.push(settings);
            return;
        }
        settings.source.sources.forEach(_walkSourcesTree);
    }

    _walkSourcesTree(settings);

    return sources;
}

type Imports = CSpellSettingsWSTO['__imports'];

function mergeImportRefs(left: CSpellSettingsWSTO, right: CSpellSettingsWSTO = {}): Imports {
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

export interface ConfigurationDependencies {
    configFiles: string[];
    dictionaryFiles: string[];
}

export function extractDependencies(settings: CSpellSettingsWSTO | CSpellSettingsI): ConfigurationDependencies {
    const settingsI = toInternalSettings(settings);
    const configFiles = [...(mergeImportRefs(settingsI) || [])].map(([filename]) => filename);
    const dictionaryFiles = calcDictionaryDefsToLoad(settingsI).map((dict) => dict.path);

    return {
        configFiles,
        dictionaryFiles,
    };
}

function resolveCwd(): string {
    const envGlobRoot = process.env[ENV_CSPELL_GLOB_ROOT];
    const cwd = envGlobRoot || process.cwd();
    return cwd;
}

function resolveParser(settings: CSpellSettingsI): Parser | undefined {
    if (!settings.parser) return undefined;
    if (typeof settings.parser === 'function') return settings.parser;

    const parserName = settings.parser;
    assert(typeof parserName === 'string');

    const parsers = extractParsers(settings.plugins);
    const parser = parsers.get(parserName);
    assert(parser, `Parser "${parserName}" not found.`);
    return parser;
}

const parserCache = new WeakMap<Exclude<CSpellSettingsI['plugins'], undefined>, Map<string, Parser>>();
const emptyParserMap = new Map<string, Parser>();

function extractParsers(plugins: CSpellSettingsI['plugins']): Map<string, Parser> {
    if (!plugins || !plugins.length) return emptyParserMap;
    const found = parserCache.get(plugins);
    if (found) return found;

    function* parsers(plugins: Plugin[]) {
        for (const plugin of plugins) {
            if (!plugin.parsers) continue;
            for (const parser of plugin.parsers) {
                yield [parser.name, parser] as const;
            }
        }
    }

    const map = new Map(parsers(plugins));
    parserCache.set(plugins, map);
    return map;
}

export const __testing__ = {
    mergeObjects,
};
