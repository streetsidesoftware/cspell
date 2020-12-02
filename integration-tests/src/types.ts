export interface Logger {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log: (message?: any, ...optionalParams: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (message?: any, ...optionalParams: any[]) => void;
}
