// cspell:ignore fname

export interface PathInterface {
    normalize(p: string): string;
    join(...paths: string[]): string;
    resolve(...paths: string[]): string;
    relative(from: string, to: string): string;
    isAbsolute(p: string): boolean;
    parse(p: string): { root: string; dir: string; base: string; ext: string; name: string };
    sep: string;
}

export type GlobMatch = GlobMatchRule | GlobMatchNoRule;

export interface GlobMatchRule {
    matched: boolean;
    glob: string;
    root: string;
    pattern: GlobPatternWithRoot;
    index: number;
    isNeg: boolean;
}

export interface GlobMatchNoRule {
    matched: false;
}

export type GlobPattern = SimpleGlobPattern | GlobPatternWithRoot | GlobPatternWithOptionalRoot;

export type SimpleGlobPattern = string;

export interface GlobPatternWithOptionalRoot {
    /**
     * a glob pattern
     */
    glob: string;
    /**
     * The root from which the glob pattern is relative.
     * @default: options.root
     */
    root?: string | undefined;
    /**
     * Optional value useful for tracing which file a glob pattern was defined in.
     */
    source?: string | undefined;
    /**
     * Optional line number in the source
     */
    line?: number | undefined;
}

export interface GlobPatternWithRoot extends GlobPatternWithOptionalRoot {
    root: string;
    /**
     * Global patterns do not need to be relative to the root.
     * Note: Some patterns start with `**` but they are tied to the root. In this case, `isGlobalPattern` is `false`.
     */
    isGlobalPattern: boolean;
}

export interface GlobPatternNormalized extends GlobPatternWithRoot {
    /** the original glob pattern before it was normalized */
    rawGlob: string;
    /** the original root */
    rawRoot: string | undefined;
}
