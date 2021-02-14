import { GlobPatternWithRoot, PathInterface } from './GlobMatcherTypes';
import * as Path from 'path';

/**
 * This function tries its best to determine if `fileOrGlob` is a path to a file or a glob pattern.
 * @param fileOrGlob - file (with absolute path) or glob.
 * @param root - absolute path to the directory that will be considered the root when testing the glob pattern.
 * @param path - optional node path methods - used for testing
 */
export function fileOrGlobToGlob(fileOrGlob: string, root: string, path: PathInterface = Path): GlobPatternWithRoot {
    const pathToGlob = path.sep === '\\' ? (p: string) => p.replace(/\\/g, '/') : (p: string) => p;

    if (fileOrGlob.startsWith(root)) {
        const rel = path.relative(root, fileOrGlob);
        return {
            glob: pathToGlob(rel),
            root,
        };
    }
    return {
        glob: pathToGlob(fileOrGlob),
        root,
    };
}
