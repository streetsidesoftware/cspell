/// <reference types="node" />
import * as minimatch from 'minimatch';
import * as cspell from './index';
import { TraceResult } from './index';
import { CheckTextInfo } from './validator';
export { TraceResult, IncludeExcludeFlag } from './index';
export interface CSpellApplicationOptions extends BaseOptions {
    verbose?: boolean;
    debug?: boolean;
    exclude?: string;
    wordsOnly?: boolean;
    unique?: boolean;
}
export interface TraceOptions extends BaseOptions {
}
export interface BaseOptions {
    config?: string;
    languageId?: string;
    local?: string;
}
export interface AppError extends NodeJS.ErrnoException {
}
export interface RunResult {
    files: number;
    filesWithIssues: Set<string>;
    issues: number;
}
export interface Issue extends cspell.TextDocumentOffset {
}
export interface GlobSrcInfo {
    glob: string;
    regex: RegExp;
    source: string;
}
export interface MessageEmitter {
    (message: string): void;
}
export interface ErrorEmitter {
    (message: string, error: Error): Promise<void>;
}
export interface SpellingErrorEmitter {
    (issue: Issue): void;
}
export interface Emitters {
    issue: SpellingErrorEmitter;
    info: MessageEmitter;
    debug: MessageEmitter;
    error: ErrorEmitter;
}
export declare class CSpellApplicationConfiguration {
    readonly files: string[];
    readonly options: CSpellApplicationOptions;
    readonly emitters: Emitters;
    readonly info: (message?: any, ...args: any[]) => void;
    readonly debug: (message?: any, ...args: any[]) => void;
    readonly logIssue: (issue: Issue) => void;
    readonly uniqueFilter: (issue: Issue) => boolean;
    readonly local: string;
    readonly configGlob: string;
    readonly configGlobOptions: minimatch.IOptions;
    readonly excludes: GlobSrcInfo[];
    constructor(files: string[], options: CSpellApplicationOptions, emitters: Emitters);
}
export declare function lint(files: string[], options: CSpellApplicationOptions, emitters: Emitters): Promise<RunResult>;
export declare function trace(words: string[], options: TraceOptions): Promise<TraceResult[]>;
export interface CheckTextResult extends CheckTextInfo {
}
export declare function checkText(filename: string, options: BaseOptions): Promise<CheckTextResult>;
export declare function createInit(_: CSpellApplicationOptions): Promise<void>;
