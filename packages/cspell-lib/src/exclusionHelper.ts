import type { Glob } from '@cspell/cspell-types';
import { GlobMatcher } from 'cspell-glob';
import { URI as Uri } from 'vscode-uri';

const defaultAllowedSchemes = new Set(['file', 'untitled']);

export type ExclusionFunction = (fileUri: string) => boolean;
export type FileExclusionFunction = (file: string) => boolean;

/** The structure of the VS Code search.exclude settings */
export interface ExcludeFilesGlobMap {
    [glob: string]: boolean;
}

export function extractGlobsFromExcludeFilesGlobMap(globMap: ExcludeFilesGlobMap): string[] {
    const globs = Object.getOwnPropertyNames(globMap).filter((glob) => globMap[glob]);
    return globs;
}

const leadingGlobPattern = /^\*\*\/([^/*{}]+)$/;

function adjustGlobPatternForBackwardsCompatibility(g: string): string {
    return g.replace(leadingGlobPattern, '**/{$1,$1/**}');
}

function adjustGlobPatternsForBackwardsCompatibility(globs: Glob[]): Glob[] {
    return globs.map((g) => {
        if (typeof g === 'string') {
            return adjustGlobPatternForBackwardsCompatibility(g);
        }
        return { ...g, glob: adjustGlobPatternForBackwardsCompatibility(g.glob) };
    });
}

/**
 * @todo Support multi root globs.
 * @param globs - glob patterns
 * @param root - root directory
 * @param allowedSchemes - allowed schemas
 */
export function generateExclusionFunctionForUri(
    globs: Glob[],
    root: string,
    allowedSchemes = defaultAllowedSchemes
): ExclusionFunction {
    const adjustedGlobs = adjustGlobPatternsForBackwardsCompatibility(globs);
    const matchFn = generateExclusionFunctionForFiles(adjustedGlobs, root);

    function testUri(uri: Uri): boolean {
        if (!allowedSchemes.has(uri.scheme)) {
            return true;
        }

        return matchFn(uri.scheme === 'file' ? uri.fsPath : uri.path);
    }

    function testUriPath(uriPath: string): boolean {
        const uri = Uri.parse(uriPath);
        return testUri(uri);
    }
    return testUriPath;
}

/**
 * @todo Support multi root globs.
 * @param globs - glob patterns
 * @param root - root directory
 * @param allowedSchemes - allowed schemas
 */
export function generateExclusionFunctionForFiles(globs: Glob[], root: string): FileExclusionFunction {
    const matcher = new GlobMatcher(globs, { root, dot: true });

    return (file: string) => matcher.match(file);
}
