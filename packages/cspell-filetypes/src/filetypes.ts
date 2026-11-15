import { definitions } from './definitions.js';
import type { FileTypeDefinition, FileTypeDefinitions, FileTypeId } from './types.js';

type ExtensionToFileTypeIdMapSet = Map<string, Set<string>>;
type ExtensionToFileTypeIdMap = Map<string, string[]>;

const binaryFormatIds = definitions.filter((d) => d.format === 'Binary').map((d) => d.id);

export const binaryLanguages: Set<string> = new Set(['binary', 'image', 'video', 'fonts', ...binaryFormatIds]);

export const generatedFiles: Set<string> = new Set([
    ...binaryLanguages,
    'map',
    'lock',
    'pdf',
    'cache_files',
    'rsa',
    'pem',
    'trie',
    'log',
]);

export const languageIds: FileTypeId[] = definitions.map(({ id }) => id);

export const fileTypeDefinitions: FileTypeDefinitions = definitions;

const mapExtensionToSetOfLanguageIds: ExtensionToFileTypeIdMapSet = buildLanguageExtensionMapSet(definitions);
const mapExtensionToLanguageIds: ExtensionToFileTypeIdMap =
    buildExtensionToLanguageIdMap(mapExtensionToSetOfLanguageIds);

interface RegExpMatchToFileTypeId {
    regexp: RegExp;
    id: FileTypeId;
}

const idsWithRegExp: RegExpMatchToFileTypeId[] = definitions.map(defToRegExp).filter((f) => !!f);
const idsWithPathRegExp: RegExpMatchToFileTypeId[] = definitions.map(defToPathRegExp).filter((f) => !!f);

/**
 * Checks to see if a file type is considered to be a binary file type.
 * @param ext - the file extension to check
 * @returns true if the file type is known to be binary.
 */
export function isBinaryExt(ext: string): boolean {
    return isBinaryFileType(getFileTypesForExt(ext));
}

/**
 * Checks to see if a file type is considered to be a binary file type.
 * @param filename - the file name or path. A `\` is read as `/`.
 * @returns true if the file type is known to be binary.
 */
export function isBinaryFile(filename: string): boolean {
    return isBinaryFileType(findMatchingFileTypes(filename));
}

/**
 * Checks to see if a file type is considered to be a binary file type.
 * @param fileTypeId - the file type id to check
 * @returns true if the file type is known to be binary.
 */
export function isBinaryFileType(fileTypeId: FileTypeId | FileTypeId[] | Iterable<FileTypeId>): boolean {
    return doesSetContainAnyOf(binaryLanguages, fileTypeId);
}

/**
 * Check if a file extension is associated with generated file.. Generated files are files that are not typically edited by a human.
 * Example:
 * - package-lock.json
 * @param ext - the file extension to check.
 * @returns true if the file type known to be generated.
 */
export function isGeneratedExt(ext: string): boolean {
    return isFileTypeGenerated(getFileTypesForExt(ext));
}

/**
 * Check if a file is auto generated. Generated files are files that are not typically edited by a human.
 * Example:
 * - package-lock.json
 * @param filename - the file name or path. A `\` is read as `/`.
 * @returns true if the file type known to be generated.
 */
export function isGeneratedFile(filename: string): boolean {
    return isFileTypeGenerated(findMatchingFileTypes(filename));
}

/**
 * Check if a file type is auto generated. Generated files are files that are not typically edited by a human.
 * Example:
 * - package-lock.json
 * @param fileTypeId - the file type id to check
 * @returns true if the file type known to be generated.
 */
export function isFileTypeGenerated(fileTypeId: FileTypeId | FileTypeId[] | Iterable<FileTypeId>): boolean {
    return doesSetContainAnyOf(generatedFiles, fileTypeId);
}

function doesSetContainAnyOf(
    setOfIds: Set<FileTypeId>,
    fileTypeId: FileTypeId | FileTypeId[] | Iterable<FileTypeId>,
): boolean {
    if (typeof fileTypeId === 'string') {
        return setOfIds.has(fileTypeId);
    }
    for (const id of fileTypeId) {
        if (setOfIds.has(id)) {
            return true;
        }
    }
    return false;
}

function buildLanguageExtensionMapSet(defs: FileTypeDefinitions): ExtensionToFileTypeIdMapSet {
    return defs.reduce((map, def) => {
        function addId(value: string) {
            autoResolve(map, value, () => new Set<string>()).add(def.id);
        }

        def.extensions.forEach(addId);
        def.filenames?.forEach((filename) => (isPathPattern(filename) ? undefined : addId(filename)));
        return map;
    }, new Map<string, Set<string>>());
}

function buildExtensionToLanguageIdMap(map: ExtensionToFileTypeIdMapSet): ExtensionToFileTypeIdMap {
    return new Map([...map].map(([k, s]) => [k, [...s]]));
}

function _getLanguagesForExt(ext: string): string[] | undefined {
    return mapExtensionToLanguageIds.get(ext) || mapExtensionToLanguageIds.get('.' + ext);
}

/**
 * Tries to find a matching language for a given file extension.
 * @param ext - the file extension to look up.
 * @returns an array of language ids that match the extension. The array is empty if no matches are found.
 */
export function getFileTypesForExt(ext: string): FileTypeId[] {
    return _getLanguagesForExt(ext) || _getLanguagesForExt(ext.toLowerCase()) || [];
}

function matchPatternsToFilename(basename: string): FileTypeId[] {
    return idsWithRegExp.filter(({ regexp }) => regexp.test(basename)).map(({ id }) => id);
}

function matchPatternsToPath(filename: string): FileTypeId[] {
    return idsWithPathRegExp.filter(({ regexp }) => regexp.test(filename)).map(({ id }) => id);
}

function _getLanguagesForBasename(basename: string): string[] | undefined {
    const found = mapExtensionToLanguageIds.get(basename);
    if (found) return found;

    const patternMatches = matchPatternsToFilename(basename);
    if (patternMatches.length) return patternMatches;

    for (let pos = basename.indexOf('.'); pos >= 0; pos = basename.indexOf('.', pos + 1)) {
        const ids = mapExtensionToLanguageIds.get(basename.slice(pos));
        if (ids) return ids;
    }

    return undefined;
}

function _getLanguagesForFilename(filename: string): string[] | undefined {
    const pathMatches = matchPatternsToPath(filename);
    if (pathMatches.length) return pathMatches;

    return _getLanguagesForBasename(filename.slice(filename.lastIndexOf('/') + 1));
}

/**
 * Find the matching file types for a given filename.
 * @param filename - the file name or path. A `\` is read as `/`.
 * @returns an array of language ids that match the filename. The array is empty if no matches are found.
 */
export function findMatchingFileTypes(filename: string): FileTypeId[] {
    filename = filename.replaceAll('\\', '/');
    return _getLanguagesForFilename(filename) || _getLanguagesForFilename(filename.toLowerCase()) || [];
}

export function autoResolve<K, V>(map: Map<K, V>, key: K, resolve: (k: K) => V): V {
    const found = map.get(key);
    if (found !== undefined || map.has(key)) return found as V;
    const value = resolve(key);
    map.set(key, value);
    return value;
}

function escapeRegEx(s: string): string {
    return s.replaceAll(/[|\\{}()[\]^$+*?.]/g, '\\$&').replaceAll('-', '\\x2d');
}

function stringOrGlob(s: string): string | RegExp {
    return s.includes('*') ? simpleGlob(s) : s;
}

function simpleGlob(s: string): RegExp {
    s = s.replaceAll('**', '*');
    let pattern = '';
    for (const char of s) {
        switch (char) {
            case '?': {
                pattern += '.';
                break;
            }
            case '*': {
                pattern += '.*';
                break;
            }
            default: {
                pattern += escapeRegEx(char);
            }
        }
    }
    return new RegExp(`^${pattern}$`);
}

function isPathPattern(filename: string): boolean {
    return filename.includes('/');
}

/**
 * Convert a path pattern, such as `.git/config`, to the source of a RegExp that matches the end of a path.
 * - `*` and `?` stay within one path segment.
 * - `**` crosses segments. Followed by `/`, it also matches no segment.
 */
export function pathPatternToRegExpSource(pattern: string): string {
    let source = '';
    for (let i = 0; i < pattern.length; ++i) {
        const char = pattern[i];
        if (pattern.startsWith('**/', i)) {
            source += '(?:.*/)?';
            i += 2;
            continue;
        }
        if (pattern.startsWith('**', i)) {
            source += '.*';
            i += 1;
            continue;
        }
        switch (char) {
            case '*': {
                source += '[^/]*';
                break;
            }
            case '?': {
                source += '[^/]';
                break;
            }
            default: {
                source += escapeRegEx(char);
            }
        }
    }
    return source;
}

function defToPathRegExp(def: FileTypeDefinition): RegExpMatchToFileTypeId | undefined {
    const sources = def.filenames?.filter(isPathPattern).map(pathPatternToRegExpSource);
    if (!sources?.length) return undefined;

    const regexp = new RegExp('(?:^|/)(?:' + sources.join('|') + ')$');
    return { regexp, id: def.id };
}

function defToRegExp(def: FileTypeDefinition): RegExpMatchToFileTypeId | undefined {
    if (!def.filenames) return undefined;
    const regExps = def.filenames
        .filter((f) => !isPathPattern(f))
        .map(stringOrGlob)
        .map((f) => (f instanceof RegExp ? f : undefined))
        .filter((f) => !!f);

    if (!regExps.length) return undefined;

    const regexp = new RegExp(regExps.map((r) => r.source).join('|'));
    return { regexp, id: def.id };
}
