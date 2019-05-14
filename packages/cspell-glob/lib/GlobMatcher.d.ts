export declare class GlobMatcher {
    readonly patterns: string[];
    readonly root?: string | undefined;
    readonly matcher: (filename: string) => boolean;
    constructor(patterns: string[], root?: string | undefined);
    match(filename: string): boolean;
}
