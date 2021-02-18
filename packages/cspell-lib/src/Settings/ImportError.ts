export class ImportError extends Error {
    constructor(msg: string, readonly cause?: Error) {
        super(msg);
    }
}
