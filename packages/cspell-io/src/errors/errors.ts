export class ErrorNotImplemented extends Error {
    constructor(
        readonly method: string,
        options?: ErrorOptions,
    ) {
        super(`Method ${method} is not supported.`, options);
    }
}

export class AssertionError extends Error {
    constructor(
        readonly message: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}
