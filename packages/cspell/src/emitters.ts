import { TextDocumentOffset, TextOffset } from 'cspell-lib';

export interface Issue extends TextDocumentOffset {
    /** text surrounding the issue text */
    context: TextOffset;
}

export type MessageType = 'Debug' | 'Info';

export type MessageTypeLookup = {
    [key in MessageType]: key;
};

export const MessageTypes: MessageTypeLookup = {
    Debug: 'Debug',
    Info: 'Info',
};

export interface MessageEmitter {
    (message: string, msgType: MessageType): void;
}

export interface DebugEmitter {
    (message: string): void;
}

export interface ErrorEmitterVoid {
    (message: string, error: Error): void;
}

export interface ErrorEmitterPromise {
    (message: string, error: Error): Promise<void>;
}

type ErrorEmitter = ErrorEmitterVoid | ErrorEmitterPromise;

export interface SpellingErrorEmitter {
    (issue: Issue): void;
}

export type ProgressTypes = 'ProgressFileComplete';
export interface ProgressItem {
    type: ProgressTypes;
}
export interface ProgressFileComplete extends ProgressItem {
    type: 'ProgressFileComplete';
    fileNum: number;
    fileCount: number;
    filename: string;
    elapsedTimeMs: number | undefined;
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
