import { TextDocumentOffset, TextOffset } from 'cspell-lib';

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

export interface MessageEmitter {
    (message: string, msgType: MessageType): void;
}

export interface DebugEmitter {
    (message: string): void;
}

type ErrorLike = Error | { message: string; name: string; toString: () => string };

export interface ErrorEmitterVoid {
    (message: string, error: ErrorLike): void;
}

export interface ErrorEmitterPromise {
    (message: string, error: ErrorLike): Promise<void>;
}

type ErrorEmitter = ErrorEmitterVoid | ErrorEmitterPromise;

export interface SpellingErrorEmitter {
    (issue: Issue): void;
}

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
export type ProgressEmitter = (p: ProgressItem | ProgressFileComplete) => void;

export interface Emitters {
    issue: SpellingErrorEmitter;
    info: MessageEmitter;
    debug: DebugEmitter;
    error: ErrorEmitter;
    progress: ProgressEmitter;
}

export function isProgressFileComplete(p: ProgressItem): p is ProgressFileComplete {
    return p.type === 'ProgressFileComplete';
}
