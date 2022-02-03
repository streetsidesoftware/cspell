import { TextDocumentOffset, TextOffset } from './TextOffset';

export interface Issue extends Omit<TextDocumentOffset, 'doc'> {
    /** text surrounding the issue text */
    context: TextOffset;
    isFlagged?: boolean;
    suggestions?: string[];
}

export type MessageType = 'Debug' | 'Info' | 'Warning';

export type MessageTypeLookup = {
    [key in MessageType]: key;
};

export const MessageTypes: MessageTypeLookup = {
    Debug: 'Debug',
    Info: 'Info',
    Warning: 'Warning',
};

export type MessageEmitter = (message: string, msgType: MessageType) => void;

export type DebugEmitter = (message: string) => void;

export type ErrorLike = Error | { message: string; name: string; toString: () => string };

export type ErrorEmitter = (message: string, error: ErrorLike) => void;

export type SpellingErrorEmitter = (issue: Issue) => void;

export type ProgressTypes = 'ProgressFileBegin' | 'ProgressFileComplete';
export type ProgressItem = ProgressFileBegin | ProgressFileComplete;

export interface ProgressBase {
    type: ProgressTypes;
}

export interface ProgressFileBase extends ProgressBase {
    type: ProgressTypes;
    fileNum: number;
    fileCount: number;
    filename: string;
}

export interface ProgressFileComplete extends ProgressFileBase {
    type: 'ProgressFileComplete';
    elapsedTimeMs: number | undefined;
    processed: boolean | undefined;
    numErrors: number | undefined;
    cached?: boolean;
}

/**
 * Notification sent just before processing a file.
 */
export interface ProgressFileBegin extends ProgressFileBase {
    type: 'ProgressFileBegin';
}

export type ProgressEmitter = (p: ProgressItem | ProgressFileComplete) => void;

export interface RunResult {
    /** Number of files processed. */
    files: number;
    /** Set of files where issues were found. */
    filesWithIssues: Set<string>;
    /** Number of issues found. */
    issues: number;
    /** Number of processing errors. */
    errors: number;
    /** Number files that used results from the cache. */
    cachedFiles?: number;
}

export type ResultEmitter = (result: RunResult) => void | Promise<void>;

export interface CSpellReporter {
    issue: SpellingErrorEmitter;
    info: MessageEmitter;
    debug: DebugEmitter;
    error: ErrorEmitter;
    progress: ProgressEmitter;
    result: ResultEmitter;
}

export interface CSpellReporterModule {
    getReporter: (settings: unknown) => CSpellReporter;
}
