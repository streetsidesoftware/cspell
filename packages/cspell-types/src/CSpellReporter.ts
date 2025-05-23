import type { TextDocumentOffset, TextOffset } from './TextOffset.js';

export interface Suggestion {
    /**
     * Word to suggest.
     */
    word: string;
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
    /**
     * `true` - if this suggestion can be an automatic fix.
     */
    isPreferred?: boolean;
}

export interface Issue extends Omit<TextDocumentOffset, 'doc'> {
    /** text surrounding the issue text */
    context: TextOffset;
    /**
     * true if the issue has been flagged as a forbidden word.
     */
    isFlagged?: boolean;
    /**
     * An optional array of replacement strings.
     */
    suggestions?: string[];
    /**
     * An optional array of suggestions.
     */
    suggestionsEx?: Suggestion[];
    /**
     * Issues are spelling issues unless otherwise specified.
     */
    issueType?: IssueType;
    /**
     * Optional message to show.
     */
    message?: string;
}

export enum IssueType {
    spelling = 0,
    directive = 1,
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
    issue?: SpellingErrorEmitter;
    info?: MessageEmitter;
    debug?: DebugEmitter;
    error?: ErrorEmitter;
    progress?: ProgressEmitter;
    result?: ResultEmitter;
}

export interface ReporterConfigurationBase {
    /**
     * The maximum number of problems to report in a file.
     *
     * @default 10000
     */
    maxNumberOfProblems?: number;

    /**
     * The maximum number of times the same word can be flagged as an error in a file.
     *
     * @default 5
     */
    maxDuplicateProblems?: number;

    /**
     * The minimum length of a word before checking it against a dictionary.
     *
     * @default 4
     */
    minWordLength?: number;

    /**
     * Ignore sequences of characters that look like random strings.
     *
     * @default true
     */
    ignoreRandomStrings?: boolean | undefined;

    /**
     * The minimum length of a random string to be ignored.
     *
     * @default 40
     */
    minRandomLength?: number | undefined;
}

interface ReporterCommandLineOptions {
    /**
     * Display verbose information
     */
    verbose?: boolean;
    /**
     * Show extensive output.
     */
    debug?: boolean;
    /**
     * Only report the words, no line numbers or file names.
     */
    wordsOnly?: boolean;
    /**
     * unique errors per file only.
     */
    unique?: boolean;
    /**
     * root directory, defaults to `cwd`
     */
    root?: string;
}

export interface ReporterConfiguration extends ReporterCommandLineOptions, ReporterConfigurationBase {}

export interface CSpellReporterModule {
    getReporter: (settings: unknown, config: ReporterConfiguration) => CSpellReporter;
}
