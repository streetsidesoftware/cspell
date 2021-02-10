import { URI as Uri } from 'vscode-uri';
import * as minimatch from 'minimatch';

const separator = '/';

const defaultAllowedSchemes = new Set(['file', 'untitled']);

export type ExclusionFunction = (filename: string) => boolean;

export type Glob = string;

export interface ExcludeFilesGlobMap {
    [glob: string]: boolean;
}

export function extractGlobsFromExcludeFilesGlobMap(globMap: ExcludeFilesGlobMap): string[] {
    const globs = Object.getOwnPropertyNames(globMap).filter((glob) => globMap[glob]);
    return globs;
}

export function pathToUri(filePath: string): Uri {
    return Uri.file(filePath);
}

export function generateExclusionFunctionForUri(
    globs: Glob[],
    root: string,
    allowedSchemes = defaultAllowedSchemes
): ExclusionFunction {
    const rootUri = pathToUri(root || '/');
    const fns = globs.map((glob) => minimatch.filter(glob, { dot: true, matchBase: true }));

    function testPath(path: string): boolean {
        return fns.reduce<boolean>((prev: boolean, fn, idx) => prev || fn(path, idx, [path]), false);
    }

    function testPathStepByStep(path: string) {
        const parts = path.split(separator);
        for (let i = 0; i < parts.length; ++i) {
            const p = parts.slice(0, i + 1).join(separator);
            if (testPath(p)) {
                return true;
            }
        }
        return false;
    }

    function testUri(uri: Uri): boolean {
        if (!allowedSchemes.has(uri.scheme)) {
            return true;
        }

        const relativeRoot = uri.path.slice(0, rootUri.path.length);
        if (relativeRoot === rootUri.path) {
            const relativeToRoot = uri.path.slice(rootUri.path.length);
            return testPathStepByStep(relativeToRoot);
        }

        // the uri is not relative to the root.
        return testPathStepByStep(uri.path);
    }

    function testUriPath(uriPath: string): boolean {
        const uri = Uri.parse(uriPath);
        return testUri(uri);
    }
    return testUriPath;
}
