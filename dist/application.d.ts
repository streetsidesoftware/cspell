export interface CSpellApplicationOptions {
    verbose: boolean;
    config?: string;
    exclude?: string;
}
export interface AppError extends NodeJS.ErrnoException {
}
export interface RunResult {
    files: number;
    issues: number;
}
export declare class CSpellApplication {
    readonly files: string[];
    readonly options: CSpellApplicationOptions;
    readonly log: (message?: any, ...args: any[]) => void;
    readonly info: (message?: any, ...args: any[]) => void;
    private configGlob;
    private configGlobOptions;
    private excludeGlobs;
    private excludes;
    constructor(files: string[], options: CSpellApplicationOptions, log: (message?: any, ...args: any[]) => void);
    run(): Promise<RunResult>;
    protected header(): void;
    protected isExcluded(filename: string): boolean;
}
