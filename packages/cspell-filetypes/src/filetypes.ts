import { definitions } from './definitions.js';
import { FileTypeDefinition, FileTypeDefinitions, FileTypeId } from './types.js';

type ExtensionToFileTypeIdMapSet = Map<string, Set<string>>;
type ExtensionToFileTypeIdMap = Map<string, string[]>;

const binaryFormatIds = definitions.filter((d) => d.format === 'Binary').map((d) => d.id);

export const binaryLanguages = new Set(['binary', 'image', 'video', 'fonts', ...binaryFormatIds]);

export const generatedFiles = new Set([
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

const mapExtensionToSetOfLanguageIds: ExtensionToFileTypeIdMapSet = buildLanguageExtensionMapSet(definitions);
const mapExtensionToLanguageIds: ExtensionToFileTypeIdMap =
    buildExtensionToLanguageIdMap(mapExtensionToSetOfLanguageIds);

interface RegExpMatchToFileTypeId {
    regexp: RegExp;
    id: FileTypeId;
}

const idsWithRegExp: RegExpMatchToFileTypeId[] = definitions.map(defToRegExp).filter((f) => !!f);

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
 * @param filename - the filename to check
 * @returns true if the file type is known to be binary.
 */
export function isBinaryFile(filename: string): boolean {
    filename = basename(filename);
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
 * @param filename - the full filename to check
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
        def.filenames?.forEach((filename) => (typeof filename === 'string' ? addId(filename) : undefined));
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

/**
 * Find the matching file types for a given filename.
 * @param filename - the full filename
 * @returns an array of language ids that match the filename. The array is empty if no matches are found.
 */
export function findMatchingFileTypes(filename: string): FileTypeId[] {
    filename = basename(filename);
    return _getLanguagesForBasename(filename) || _getLanguagesForBasename(filename.toLowerCase()) || [];
}

const regExpPathSep = /[\\/]/g;

function basename(filename: string): string {
    return regExpPathSep.test(filename) ? filename.split(regExpPathSep).slice(-1).join('') : filename;
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
    return new RegExp(pattern);
}

function defToRegExp(def: FileTypeDefinition): RegExpMatchToFileTypeId | undefined {
    if (!def.filenames) return undefined;
    const regExps = def.filenames
        .map(stringOrGlob)
        .map((f) => (f instanceof RegExp ? f : undefined))
        .filter((f) => !!f);

    if (!regExps.length) return undefined;

    const regexp = new RegExp(regExps.map((r) => r.source).join('|'));
    return { regexp, id: def.id };
}
