import type { SuggestionsConfiguration } from './SuggestionsConfiguration';
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
    /**
     * The text surrounding the issue text. It is only included if the reporter cannot generated it automatically.
     */
    context?: TextOffset | undefined;
    /**
     * true if the issue has been flagged as a forbidden word.
     */
    isFlagged?: boolean | undefined;
    /**
     * An optional array of replacement strings.
     */
    suggestions?: string[] | undefined;
    /**
     * An optional array of suggestions.
     */
    suggestionsEx?: Suggestion[] | undefined;
    /**
     * Issues are spelling issues unless otherwise specified.
     */
    issueType?: IssueType | undefined;
    /**
     * Optional message to show.
     */
    message?: string | undefined;

    /**
     * `true` - if it has been determined if simple suggestions are available.
     * `false` - if simple suggestions are NOT available.
     * `undefined` - if it has not been determined.
     * @since 9.1.0
     */
    hasSimpleSuggestions?: boolean | undefined;

    /**
     * This setting is used for common typo detection.
     * - `true` - if it has been determined if preferred suggestions are available.
     * - `false` - if preferred suggestions are NOT available.
     * - `undefined` - if it has not been determined.
     * @since 9.1.0
     */
    hasPreferredSuggestions?: boolean | undefined;
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

export type SpellingErrorEmitter = (issue: Issue, options?: ReportIssueOptions) => void;

export type ProgressTypes = 'ProgressFileBegin' | 'ProgressFileComplete';
export type ProgressItem = ProgressFileBegin | ProgressFileComplete;

export interface ProgressBase {
    type: ProgressTypes;
}

export interface ProgressFileBase extends ProgressBase {
    type: ProgressTypes;
    /**
     * The sequence number of the file being processed.
     */
    fileNum: number;
    /**
     * The total number of files being processed.
     */
    fileCount: number;
    /**
     * The file name or href of file being processed.
     */
    filename: string;
}

export interface ProgressFileComplete extends ProgressFileBase {
    type: 'ProgressFileComplete';
    /**
     * The time it took to process the file in milliseconds.
     * If `undefined`, then the elapsed time is not available.
     */
    elapsedTimeMs: number | undefined;
    /**
     * `true` if the file was processed.
     * `false` if the file was skipped.
     */
    processed: boolean | undefined;
    /**
     * Number of errors and issues found in the file.
     */
    numErrors: number | undefined;
    /**
     * `true` if the file was processed from the cache.
     */
    cached?: boolean;
    /**
     * Issues found in the file.
     * If `undefined`, then the issues are not available.
     */
    issues?: Iterable<Issue> | undefined;
    /**
     * reportIssuesOptions to be used when reporting issues.
     */
    reportIssueOptions?: ReportIssueOptions | undefined;
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

export interface CSpellReporterEmitters {
    issue?: SpellingErrorEmitter;
    info?: MessageEmitter;
    debug?: DebugEmitter;
    error?: ErrorEmitter;
    progress?: ProgressEmitter;
    result?: ResultEmitter;
}

export interface CSpellReporter extends CSpellReporterEmitters {
    /**
     * Allows the reporter to specify supported features.
     * @since 9.1.0
     */
    features?: FeaturesSupportedByReporter | undefined;
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

/**
 * Allows the reporter to advertise which features it supports.
 */
export interface FeaturesSupportedByReporter {
    /**
     * The reporter supports the {@link ReportingConfiguration.unknownWords} option and understands
     * how to filter issues based upon {@link Issue.isFlagged}, {@link Issue.hasSimpleSuggestions} and {@link Issue.hasPreferredSuggestions}.
     * - `true` - The `reporter.issue` method will be called for all spelling issues and it is expected to handle .
     * - `false | undefined` - the unknown words will be filtered out based upon the `unknownWords` setting before being passed to the reporter.
     */
    unknownWords?: boolean | undefined;

    /**
     * The reporter supports the {@link Issue.issueType} option.
     * - `true` - the reporter will be called with all issues types.
     * - `false | undefined` - only {@link IssueType.spelling} issues will be passed to the reporter.
     */
    issueType?: boolean | undefined;

    /**
     * The reporter can generate context for issues.
     * - `true` - the reporter will be called with issues that do NOT have a `context` property.
     * - `false | undefined` - the reporter will be called with issues that have a `context` property.
     */
    contextGeneration?: boolean | undefined;
}

export interface ReportingConfiguration
    extends ReporterConfigurationBase,
        SuggestionsConfiguration,
        UnknownWordsConfiguration {}

export interface ReportIssueOptions extends UnknownWordsConfiguration {
    /**
     * Verify that the in-document directives are correct.
     */
    validateDirectives?: boolean | undefined;

    /**
     * Tells the spell checker to show context around the issue.
     * It is the number of characters to show on either side of the issue.
     */
    showContext?: number | undefined;
}

/**
 * Possible choices for how to handle unknown words.
 */
export type UnknownWordsChoices = 'report-all' | 'report-simple' | 'report-common-typos' | 'report-flagged';

export const unknownWordsChoices: {
    readonly ReportAll: 'report-all';
    readonly ReportSimple: 'report-simple';
    readonly ReportCommonTypos: 'report-common-typos';
    readonly ReportFlagged: 'report-flagged';
} = {
    ReportAll: 'report-all',
    ReportSimple: 'report-simple',
    ReportCommonTypos: 'report-common-typos',
    ReportFlagged: 'report-flagged',
} as const satisfies Record<string, UnknownWordsChoices>;

export interface UnknownWordsConfiguration {
    /**
     * Controls how unknown words are handled.
     *
     * - `report-all` - Report all unknown words (default behavior)
     * - `report-simple` - Report unknown words that have simple spelling errors, typos, and flagged words.
     * - `report-common-typos` - Report unknown words that are common typos and flagged words.
     * - `report-flagged` - Report unknown words that are flagged.
     *
     * @default "report-all"
     * @since 9.1.0
     */
    unknownWords?: UnknownWordsChoices | undefined;
}
