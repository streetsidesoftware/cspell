export class LinterError extends Error {
    constructor(message: string) {
        super(message);
    }

    toString(): string {
        return this.message;
    }
}
