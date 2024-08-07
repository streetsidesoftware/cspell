import type { WriteStream } from 'node:tty';
import { formatWithOptions } from 'node:util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Log = (format?: any, ...params: any[]) => void;

type IOStream = NodeJS.WritableStream &
    Pick<WriteStream, 'isTTY' | 'rows' | 'columns'> &
    Pick<Partial<WriteStream>, 'hasColors' | 'clearLine' | 'getColorDepth'>;

export interface IConsole {
    readonly log: Log;
    readonly error: Log;
    readonly info: Log;
    readonly warn: Log;
    readonly stderrChannel: Channel;
    readonly stdoutChannel: Channel;
    // readonly stderr: IOStream;
    // readonly stdout: IOStream;
}

class ImplChannel implements Channel {
    constructor(readonly stream: IOStream) {}

    write = (msg: string) => this.stream.write(msg);
    writeLine = (msg: string) => this.write(msg + '\n');
    clearLine = (dir: -1 | 0 | 1, callback?: () => void) => this.stream.clearLine?.(dir, callback) ?? false;
    printLine = (...params: unknown[]) =>
        this.writeLine((params.length && formatWithOptions({ colors: this.stream.hasColors?.() }, ...params)) || '');
    getColorLevel = () => getColorLevel(this.stream);
}

class Console implements IConsole {
    readonly stderrChannel: Channel;
    readonly stdoutChannel: Channel;
    constructor(
        readonly stdout = process.stdout,
        readonly stderr = process.stderr,
    ) {
        this.stderrChannel = new ImplChannel(this.stderr);
        this.stdoutChannel = new ImplChannel(this.stdout);
    }

    log: Log = (...p): void => this.stdoutChannel.printLine(...p);
    error: Log = (...p) => this.stderrChannel.printLine(...p);

    info: Log = this.log;
    warn: Log = this.error;
}

export const console: IConsole = new Console();

export function log(...p: Parameters<typeof console.log>) {
    console.log(...p);
}

export function error(...p: Parameters<typeof console.error>) {
    console.error(...p);
}

export interface Channel {
    stream: IOStream;
    write: (msg: string) => void;
    writeLine: (msg: string) => void;
    clearLine: (dir: -1 | 0 | 1, callback?: () => void) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    printLine: (format?: any, ...params: any[]) => void;
    getColorLevel: () => 0 | 1 | 2 | 3;
}

export function getColorLevel(stream: IOStream): 0 | 1 | 2 | 3 {
    const depth = stream.getColorDepth?.() || 0;
    switch (depth) {
        case 1: {
            return 1;
        }
        case 4: {
            return 2;
        }
        case 24: {
            return 3;
        }
        default: {
            return 0;
        }
    }
}
