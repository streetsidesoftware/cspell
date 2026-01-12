export class CanceledRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CanceledRequestError';
    }
}

export class AbortRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AbortRequestError';
    }
}
