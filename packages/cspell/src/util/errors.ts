export class CheckFailed extends Error {
    constructor(message: string, readonly exitCode: number = 1) {
        super(message);
    }
}

export class ApplicationError extends Error {
    constructor(message: string, readonly exitCode: number = 1) {
        super(message);
    }
}
