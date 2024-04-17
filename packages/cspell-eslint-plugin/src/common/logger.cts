import fs from 'node:fs';
import path from 'node:path';
import { format } from 'node:util';

const debugMode = false;

export interface LoggerOptions {
    logFile?: string;
    cwd?: string;
    /** true - write to file, false - output to console. */
    logToFile?: boolean;
    /** enable logging by default? */
    enabled?: boolean;
    useAsync?: boolean;
}

export class Logger {
    readonly logFile: string;
    readonly cwd: string;
    logToFile = true;
    enabled = true;
    useAsync = false;

    constructor(readonly options: LoggerOptions) {
        this.cwd = path.resolve(options.cwd || '.');
        const logFileBasename = options.logFile || '.cspell-eslint-plugin.log';
        this.logFile = path.resolve(this.cwd, logFileBasename);
        this.logToFile = options.logToFile ?? true;
        this.enabled = options.enabled ?? debugMode;
        this.useAsync = options.useAsync ?? false;
    }

    private _log(...p: Parameters<typeof console.log>): void {
        if (!this.enabled) return;
        if (!this.logToFile) return console.log(...p);
        const message = new Date().toISOString() + ' ' + prefixLines(format(...p), '  ') + '\n';
        this.useAsync
            ? fs.appendFile(this.logFile, message, (err) => err && console.error(err))
            : fs.appendFileSync(this.logFile, message);
        return;
    }

    log = this._log.bind(this);
}

let logger: Logger | undefined;

export function getDefaultLogger(): Logger {
    if (logger) return logger;
    logger = new Logger({});
    return logger;
}

function prefixLines(text: string, prefix: string, startIndex = 1): string {
    return text
        .split('\n')
        .map((line, index) => (index >= startIndex ? prefix + line : line))
        .map((line) => (line.trim() == '' ? '' : line))
        .join('\n');
}
