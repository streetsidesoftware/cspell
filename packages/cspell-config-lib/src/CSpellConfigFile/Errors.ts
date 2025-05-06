export class ParseError extends Error {
    constructor(
        readonly url: URL,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message || `Unable to parse ${url}`, options);
    }
}
