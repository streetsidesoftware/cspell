// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Logger = (message?: any, ...optionalParams: any[]) => void;

const defaultLogger = console.log;
let log: Logger = defaultLogger;

export function setLogger(logger?: Logger): void {
    log = logger ?? defaultLogger;
}

export function getLogger(): Logger {
    return log;
}
