import { TextDocumentOffset, TextOffset } from './TextOffset';

export interface Issue extends TextDocumentOffset {
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

export type MessageEmitterVoid = (message: string, msgType: MessageType) => void;
export type MessageEmitterPromise = (message: string, msgType: MessageType) => Promise<void>;
export type MessageEmitter = MessageEmitterVoid | MessageEmitterPromise;

export type DebugEmitterVoid = (message: string) => void;
export type DebugEmitterPromise = (message: string) => Promise<void>;
export type DebugEmitter = DebugEmitterVoid | DebugEmitterPromise;

type ErrorLike = Error | { message: string; name: string; toString: () => string };

export type ErrorEmitterVoid = (message: string, error: ErrorLike) => void;
export type ErrorEmitterPromise = (message: string, error: ErrorLike) => void;
export type ErrorEmitter = ErrorEmitterVoid | ErrorEmitterPromise;

export type SpellingErrorEmitterVoid = (issue: Issue) => void;
export type SpellingErrorEmitterPromise = (issue: Issue) => Promise<void>;
export type SpellingErrorEmitter = SpellingErrorEmitterVoid | SpellingErrorEmitterPromise;

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
}

export type ProgressEmitterVoid = (p: ProgressItem | ProgressFileComplete) => void;
export type ProgressEmitterPromise = (p: ProgressItem | ProgressFileComplete) => Promise<void>;
export type ProgressEmitter = ProgressEmitterVoid | ProgressEmitterPromise;

export interface RunResult {
    files: number;
    filesWithIssues: Set<string>;
    issues: number;
    errors: number;
}
export type ResultEmitterVoid = (result: RunResult) => void;
export type ResultEmitterPromise = (result: RunResult) => Promise<void>;
export type ResultEmitter = ResultEmitterVoid | ResultEmitterPromise;

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
