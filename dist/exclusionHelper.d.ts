export declare type ExclusionFunction = (filename: string) => boolean;
export declare type Glob = string;
export interface ExcludeFilesGlobMap {
    [glob: string]: boolean;
}
export declare function extractGlobsFromExcludeFilesGlobMap(globMap: ExcludeFilesGlobMap): string[];
export declare function pathToUri(filePath: string): string;
export declare function generateExclusionFunctionForUri(globs: Glob[], root: string): ExclusionFunction;
