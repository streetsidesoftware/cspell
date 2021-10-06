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

export type ProgressTypes = 'ProgressFileComplete';
export type ProgressItem = ProgressFileComplete;

interface ProgressBase {
    type: ProgressTypes;
}
export interface ProgressFileComplete extends ProgressBase {
    type: 'ProgressFileComplete';
    fileNum: number;
    fileCount: number;
    filename: string;
    elapsedTimeMs: number | undefined;
    processed: boolean | undefined;
    numErrors: number | undefined;
    cached?: boolean;
}

export type ProgressEmitter = (p: ProgressItem | ProgressFileComplete) => void;

export interface RunResult {
    files: number;
    filesWithIssues: Set<string>;
    issues: number;
    errors: number;
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
