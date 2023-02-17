import { relative, isAbsolute, resolve } from 'path';

const regExpIsRelative = /^\.\.?[/\\]/;

/**
 * Check if a file is in a directory
 * @param root - absolute directory
 * @param filename - file / path to check.
 * @returns
 */
export function doesContain(root: string, filename: string): boolean {
    const rel = relative(root, resolve(root, filename));
    return !isAbsolute(rel) && !isRelativePath(rel);
}

/**
 * Check if a files starts with `./` or `../`
 * @param filename
 * @returns
 */
export function isRelativePath(filename: string): boolean {
    return regExpIsRelative.test(filename);
}

/**
 * Rebase a filename
 * @param filename - file in fromDir
 * @param fromDir - the starting directory
 * @param toDir - the target directory
 * @returns the new filename
 */
export function rebaseFile(filename: string, fromDir: string, toDir: string): string {
    const rel = relative(fromDir, resolve(fromDir, filename));
    if (isAbsolute(rel) || isRelativePath(rel)) return filename;
    return resolve(toDir, rel);
}
