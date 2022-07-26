export class ErrorNotImplemented extends Error {
    constructor(readonly method: string) {
        super(`Method ${method} is not supported.`);
    }
}
