/* eslint-disable no-irregular-whitespace */
import * as Path from 'node:path';

import { FileUrlBuilder, isUrlLike } from '@cspell/url';

import type {
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
    GlobPatternWithRoot,
    PathInterface,
} from './GlobMatcherTypes.js';

const { posix } = Path;
// const relRegExp = /^\..?[\\/]/;
/** test for glob patterns starting with `**` */
const isGlobalPatternRegExp = /^!*[*]{2}/;

const hasGlobCharactersRegExp = /[*?{}[\]]/;

const fileUrlBuilder = new FileUrlBuilder();

export const GlobPlaceHolders = {
    cwd: '${cwd}',
};

export const GlobPatterns = {
    suffixAny: '/**',
    /**
     * Use as as suffix for a directory. Example `node_modules/` becomes `node_modules/**​/*`.
     */
    suffixDir: '/**/*',
    prefixAny: '**/',
};

/**
 * This function tries its best to determine if `fileOrGlob` is a path to a file or a glob pattern.
 * @param fileOrGlob - file (with absolute path) or glob.
 * @param root - absolute path to the directory that will be considered the root when testing the glob pattern.
 * @param path - optional node path methods - used for testing
 */
export function fileOrGlobToGlob(
    fileOrGlob: string | GlobPattern,
    root: string,
    path: PathInterface = Path,
): GlobPatternWithRoot {
    const toForwardSlash = path.sep === '\\' ? (p: string) => p.replaceAll('\\', '/') : (p: string) => p;
    const builder = urlBuilder(path);
    fileOrGlob = typeof fileOrGlob === 'string' ? toForwardSlash(fileOrGlob) : fileOrGlob;

    const pattern = toGlobPatternWithRoot(fileOrGlob, root);

    // pattern.root might still be relative.
    fixPatternRoot(pattern, builder);

    // pattern.glob might still be a file or a relative glob pattern.
    fixPatternGlob(pattern, builder);

    return pattern;
}

export function isGlobPatternWithOptionalRoot(g: GlobPattern): g is GlobPatternWithOptionalRoot {
    return typeof g !== 'string' && typeof g.glob === 'string';
}

export function isGlobPatternWithRoot(g: GlobPattern): g is GlobPatternWithRoot {
    if (typeof g === 'string') return false;
    return typeof g.root === 'string' && 'isGlobalPattern' in g;
}

export function isGlobPatternNormalized(g: GlobPattern | GlobPatternNormalized): g is GlobPatternNormalized {
    if (!isGlobPatternWithRoot(g)) return false;

    const gr = g as GlobPatternNormalized;
    return 'rawGlob' in gr && 'rawRoot' in gr && typeof gr.rawGlob === 'string';
}

export function isGlobPatternNormalizedToRoot(
    g: GlobPattern | GlobPatternNormalized,
    options: NormalizeOptions,
): g is GlobPatternNormalized {
    if (!isGlobPatternNormalized(g)) return false;
    return g.root === options.root;
}

function urlBuilder(path: PathInterface = Path): FileUrlBuilder {
    return path === Path ? fileUrlBuilder : new FileUrlBuilder({ path });
}

/**
 * @param pattern glob pattern
 * @param nested when true add `**​/<glob>/​**`
 * @returns the set of matching globs.
 */
function normalizePattern(pattern: string, nested: boolean): string[] {
    pattern = pattern.replace(/^(!!)+/, '');
    const isNeg = pattern.startsWith('!');
    const prefix = isNeg ? '!' : '';
    pattern = isNeg ? pattern.slice(1) : pattern;
    const patterns = nested ? normalizePatternNested(pattern) : normalizePatternGeneral(pattern);
    return patterns.map((p) => prefix + p);
}

function normalizePatternNested(pattern: string): string[] {
    // no slashes will match files names or folders
    if (!pattern.includes('/')) {
        if (pattern === '**') return ['**'];
        return ['**/' + pattern, '**/' + pattern + '/**'];
    }
    const hasLeadingSlash = pattern.startsWith('/');
    pattern = hasLeadingSlash ? pattern.slice(1) : pattern;

    if (pattern.endsWith('/')) {
        // See: https://git-scm.com/docs/gitignore#_pattern_format
        // if it only has a trailing slash, allow matching against a nested directory.
        return hasLeadingSlash || pattern.slice(0, -1).includes('/') ? [pattern + '**/*'] : ['**/' + pattern + '**/*'];
    }

    if (pattern.endsWith('**')) {
        return [pattern];
    }

    return [pattern, pattern + '/**'];
}

function normalizePatternGeneral(pattern: string): [string] {
    pattern = pattern.startsWith('/') ? pattern.slice(1) : pattern;
    pattern = pattern.endsWith('/') ? pattern + '**/*' : pattern;
    return [pattern];
}

export interface NormalizeOptions {
    /**
     * Indicates that the glob should be modified to match nested patterns.
     *
     * Example: `node_modules` becomes `**​/node_modules/​**`, `**​/node_modules`, and `node_modules/​**`
     */
    nested: boolean;
    /**
     * This is the root to use for the glob if the glob does not already contain one.
     */
    root: string;

    /**
     * This is the replacement for `${cwd}` in either the root or in the glob.
     */
    cwd?: string;

    /**
     * Optional path interface for working with paths.
     */
    nodePath?: PathInterface;
}

/**
 *
 * @param patterns - glob patterns to normalize.
 * @param options - Normalization options.
 */
export function normalizeGlobPatterns(patterns: GlobPattern[], options: NormalizeOptions): GlobPatternNormalized[] {
    function* normalize() {
        for (const glob of patterns) {
            if (isGlobPatternNormalized(glob)) {
                yield isGlobPatternNormalizedToRoot(glob, options)
                    ? glob
                    : normalizeGlobToRoot(glob, options.root, options.nodePath || Path);
                continue;
            }
            yield* normalizeGlobPattern(glob, options);
        }
    }

    return [...normalize()];
}

export function normalizeGlobPattern(g: GlobPattern, options: NormalizeOptions): GlobPatternNormalized[] {
    const { root, nodePath: path = Path, nested } = options;
    const builder = urlBuilder(path);
    const cwd = options.cwd ?? path.resolve();
    const cwdUrl = builder.toFileDirURL(cwd);
    const rootUrl = builder.toFileDirURL(root, cwdUrl);

    const gIsGlobalPattern = isGlobPatternWithRoot(g) ? g.isGlobalPattern : undefined;
    g = !isGlobPatternWithOptionalRoot(g) ? { glob: g } : g;

    const gr = { ...g, root: g.root ?? root };

    const rawRoot = gr.root;
    const rawGlob = g.glob;

    gr.glob = trimGlob(g.glob);
    if (gr.glob.startsWith(GlobPlaceHolders.cwd)) {
        gr.glob = gr.glob.replace(GlobPlaceHolders.cwd, '');
        gr.root = GlobPlaceHolders.cwd;
    }
    if (gr.root.startsWith(GlobPlaceHolders.cwd)) {
        const relRoot = gr.root.replace(GlobPlaceHolders.cwd, './');
        const r = builder.toFileDirURL(relRoot, cwdUrl);
        r.pathname = posix.normalize(r.pathname);
        gr.root = builder.urlToFilePathOrHref(r);
    }
    const isGlobalPattern = gIsGlobalPattern ?? isGlobalGlob(gr.glob);
    gr.root = builder.urlToFilePathOrHref(builder.toFileDirURL(gr.root, rootUrl));

    const globs = normalizePattern(gr.glob, nested);
    return globs.map((glob) => ({ ...gr, glob, rawGlob, rawRoot, isGlobalPattern }));
}

/**
 * Try to adjust the root of a glob to match a new root. If it is not possible, the original glob is returned.
 * Note: this does NOT generate absolutely correct glob patterns. The results are intended to be used as a
 * first pass only filter. Followed by testing against the original glob/root pair.
 * @param glob - glob to map
 * @param root - new root to use if possible
 * @param path - Node Path modules to use (testing only)
 */
export function normalizeGlobToRoot<Glob extends GlobPatternWithRoot>(
    glob: Glob,
    root: string,
    path: PathInterface,
): Glob {
    const builder = urlBuilder(path);
    glob = { ...glob };
    fixPatternRoot(glob, builder);
    const rootURL = builder.toFileDirURL(root);
    root = builder.urlToFilePathOrHref(rootURL);

    if (glob.root === root) {
        return glob;
    }

    const globRootUrl = builder.toFileDirURL(glob.root);
    const relFromRootToGlob = builder.relative(rootURL, globRootUrl);

    if (!relFromRootToGlob) {
        return glob;
    }

    if (glob.isGlobalPattern) {
        return { ...glob, root };
    }

    const relFromGlobToRoot = builder.relative(globRootUrl, rootURL);
    const globIsUnderRoot = isRelativeValueNested(relFromRootToGlob);
    const rootIsUnderGlob = isRelativeValueNested(relFromGlobToRoot);

    // Root and Glob are not in the same part of the directory tree.
    if (!globIsUnderRoot && !rootIsUnderGlob) {
        return glob;
    }

    const isNeg = glob.glob.startsWith('!');
    const g = isNeg ? glob.glob.slice(1) : glob.glob;
    const prefix = isNeg ? '!' : '';

    // prefix with root
    if (globIsUnderRoot) {
        // if (relFromRootToGlob.startsWith('..')) {
        //     console.warn('%o', {
        //         globRootUrl: globRootUrl.href,
        //         rootURL: rootURL.href,
        //         relFromRootToGlob,
        //         relFromGlobToRoot,
        //         globIsUnderRoot,
        //         rootIsUnderGlob,
        //     });
        // }
        const relGlob = relFromRootToGlob;

        return {
            ...glob,
            glob: prefix + posix.join(relGlob, g),
            root,
        };
    }

    // The root is under the glob root
    // The more difficult case, the glob is higher than the root
    // A best effort is made, but does not do advanced matching.
    const relGlob = (relFromGlobToRoot + '/').replaceAll('//', '/');
    const rebasedGlob = rebaseGlob(g, relGlob);

    return rebasedGlob ? { ...glob, glob: prefix + rebasedGlob, root } : glob;
}

export function isRelativeValueNested(rel: string): boolean {
    return !rel || !(rel === '..' || rel.startsWith('../') || rel.startsWith('/'));
}

/**
 * Rebase a glob string to a new prefix
 * @param glob - glob string
 * @param rebaseTo - glob prefix
 */
export function rebaseGlob(glob: string, rebaseTo: string): string | undefined {
    if (!rebaseTo || rebaseTo === '/') return glob;
    if (glob.startsWith('**')) return glob;
    rebaseTo = rebaseTo.endsWith('/') ? rebaseTo : rebaseTo + '/';

    if (glob.startsWith(rebaseTo)) {
        return glob.slice(rebaseTo.length);
    }

    const relParts = rebaseTo.split('/');
    const globParts = glob.split('/');

    for (let i = 0; i < relParts.length && i < globParts.length; ++i) {
        const relSeg = relParts[i];
        const globSeg = globParts[i];
        // the empty segment due to the end relGlob / allows for us to test against an empty segment.
        if (!relSeg || globSeg === '**') {
            return globParts.slice(i).join('/');
        }
        if (relSeg !== globSeg && globSeg !== '*') {
            break;
        }
    }
    return undefined;
}

/**
 * Trims any trailing spaces, tabs, line-feeds, new-lines, and comments
 * @param glob - glob string
 * @returns trimmed glob
 */
export function trimGlob(glob: string): string {
    glob = globRemoveComment(glob);
    glob = trimGlobLeft(glob);
    glob = trimGlobRight(glob);
    return glob;
}

function globRemoveComment(glob: string): string {
    return glob.replace(/(?<=^|\s)#.*/, '');
}

const spaces: Record<string, true> = {
    ' ': true,
    '\t': true,
    '\n': true,
    '\r': true,
};

/**
 * Trim any trailing spaces, tabs, line-feeds, or new-lines
 * Handles a trailing \<space>
 * @param glob - glob string
 * @returns glob string with space to the right removed.
 */
function trimGlobRight(glob: string): string {
    const lenMin1 = glob.length - 1;
    let i = lenMin1;
    while (i >= 0 && glob[i] in spaces) {
        --i;
    }
    if (glob[i] === '\\') {
        ++i;
    }
    ++i;
    return i ? glob.slice(0, i) : '';
}

/**
 * Trim any leading spaces, tabs, line-feeds, or new-lines
 * @param glob - any string
 * @returns string with leading spaces removed.
 */
function trimGlobLeft(glob: string): string {
    return glob.trimStart();
}

function isGlobalGlob(glob: string): boolean {
    return isGlobalPatternRegExp.test(glob);
}

function hasGlobCharacters(glob: string): boolean {
    return hasGlobCharactersRegExp.test(glob);
}

/**
 * Split a glob into a path and a glob portion.
 */
interface SplitGlob {
    /**
     * the leading path portion of a glob
     * it does not contain any glob characters.
     */
    path: string | undefined;
    /**
     * The glob portion of the glob.
     */
    glob: string;
}

function isGlobPart(part: string): boolean {
    if (part === GlobPlaceHolders.cwd) return false;
    return hasGlobCharacters(part);
}

/**
 * Split a glob into a path and a glob portion.
 * The path portion does not contain any glob characters.
 * Path might be empty. The glob portion should always be non-empty.
 * @param glob - glob string pattern
 * @returns
 */
function splitGlob(glob: string): SplitGlob {
    const parts = glob.split('/');

    const p = parts.findIndex(isGlobPart);
    const s = p < 0 ? parts.length - 1 : p;
    return createSplitGlob(s ? parts.slice(0, s).join('/') : undefined, parts.slice(s).join('/'));
}

function createSplitGlob(path: string | undefined, glob: string): SplitGlob {
    return { path, glob };
}

function rootToUrl(root: string, builder: FileUrlBuilder): URL {
    if (root.startsWith(GlobPlaceHolders.cwd)) {
        return new URL(builder.normalizeFilePathForUrl(root.replace(GlobPlaceHolders.cwd, '.')), builder.cwd);
    }

    return builder.toFileDirURL(root);
}

function toGlobPatternWithRoot(glob: GlobPattern, root: string): GlobPatternWithRoot {
    // We need to preserve isGlobal pattern so it gets correctly set later.
    const isGlobal = isGlobPatternWithRoot(glob) ? glob.isGlobalPattern : undefined;
    const pattern = isGlobPatternWithRoot(glob)
        ? { ...glob }
        : typeof glob === 'string'
          ? { glob, root, isGlobalPattern: false }
          : { isGlobalPattern: false, ...glob, root: glob.root ?? root };

    if (pattern.glob.startsWith(GlobPlaceHolders.cwd)) {
        pattern.root = GlobPlaceHolders.cwd;
        pattern.glob = pattern.glob.replace(GlobPlaceHolders.cwd, '');
    }

    pattern.isGlobalPattern = isGlobal ?? isGlobalGlob(pattern.glob);

    return pattern;
}

function fixPatternRoot(glob: GlobPatternWithRoot, builder: FileUrlBuilder): void {
    // Gets resoled later.
    if (glob.root.startsWith(GlobPlaceHolders.cwd)) {
        return;
    }

    glob.root = builder.urlToFilePathOrHref(rootToUrl(glob.root, builder));
}

/**
 * Adjust the glob pattern in case it is a file or a relative glob.
 * @param glob
 * @param builder
 * @returns
 */
function fixPatternGlob(glob: GlobPatternWithRoot, builder: FileUrlBuilder): void {
    const rootURL = builder.toFileURL(glob.root);
    if (isUrlLike(glob.glob)) {
        // The glob is a URL, we need to convert it to a glob.
        const url = new URL(glob.glob);
        const split = splitGlob(url.pathname);
        glob.glob = split.glob;
        glob.root = builder.urlToFilePathOrHref(new URL(split.path || '/', url));
        fixPatternRelativeToRoot(glob, rootURL, builder);
        return;
    }

    const split = splitGlob(glob.glob);
    glob.glob = split.glob;
    if (split.path !== undefined) {
        glob.root = builder.urlToFilePathOrHref(builder.toFileDirURL(split.path, glob.root));
    }
    fixPatternRelativeToRoot(glob, rootURL, builder);
}

function fixPatternRelativeToRoot(glob: GlobPatternWithRoot, root: URL, builder: FileUrlBuilder): void {
    const rel = builder.relative(root, builder.toFileDirURL(glob.root));
    if (rel.startsWith('/')) return;
    if (rel.startsWith('../')) {
        // const n = rel.split('../').length - 1;
        // if (n <= 3) {
        //     fixPatternRelativeToRoot(glob, new URL('../', root), builder);
        // }
        return;
    }
    glob.root = builder.urlToFilePathOrHref(root);
    glob.glob = rel + glob.glob;
}

export const __testing__ = {
    rebaseGlob,
    trimGlob,
    isGlobalGlob,
};
