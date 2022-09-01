import { Glob, GlobDef } from '@cspell/cspell-types';

export function toGlobDef(g: undefined, root: string | undefined, source: string | undefined): undefined;
export function toGlobDef(g: Glob, root: string | undefined, source: string | undefined): GlobDef;
export function toGlobDef(g: Glob[], root: string | undefined, source: string | undefined): GlobDef[];
export function toGlobDef(g: Glob | Glob[], root: string | undefined, source: string | undefined): GlobDef | GlobDef[];
export function toGlobDef(
    g: Glob | Glob[] | undefined,
    root: string | undefined,
    source: string | undefined
): GlobDef | GlobDef[] | undefined {
    if (g === undefined) return undefined;
    if (Array.isArray(g)) {
        return g.map((g) => toGlobDef(g, root, source));
    }
    if (typeof g === 'string') {
        const glob: GlobDef = { glob: g };
        if (root !== undefined) {
            glob.root = root;
        }
        return toGlobDef(glob, root, source);
    }
    if (source) {
        return { ...g, source };
    }
    return g;
}
