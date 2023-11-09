export class ErrorNotImplemented extends Error {
    constructor(
        readonly method: string,
        options?: ErrorOptions,
    ) {
        super(`Method ${method} is not supported.`, options);
    }
}
