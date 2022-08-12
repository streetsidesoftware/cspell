import { isError } from '../../util/errors';

export class ImportError extends Error {
    readonly cause: Error | undefined;
    constructor(msg: string, cause?: Error | unknown) {
        super(msg);
        this.cause = isError(cause) ? cause : undefined;
    }
}

export class UnsupportedSchema extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class UnsupportedPnpFile extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
