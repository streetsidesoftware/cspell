// cspell:ignore fname

export interface PathInterface {
    normalize(p: string): string;
    join(...paths: string[]): string;
    resolve(...paths: string[]): string;
    relative(from: string, to: string): string;
    isAbsolute(p: string): boolean;
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
}

export interface GlobPatternNormalized extends GlobPatternWithRoot {
    /** the original glob pattern before it was normalized */
    rawGlob: string;
    /** the original root */
    rawRoot: string | undefined;
}
