export class Future<T> {
    #isResolved = false;
    #isRejected = false;
    #promise: Promise<T>;
    #resolve: (value: T | PromiseLike<T>) => void;
    #reject: (reason?: unknown) => void;

    constructor() {
        this.#reject = noop;
        this.#resolve = noop;
        this.#promise = new Promise<T>((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    /**
     * Indicates if the promise has been resolved or rejected.
     *
     * Use isRejected to determine if it was rejected.
     */
    get isResolved(): boolean {
        return this.#isResolved;
    }

    /**
     * Indicates if the promise has been rejected.
     */
    get isRejected(): boolean {
        return this.#isRejected;
    }

    get promise(): Promise<T> {
        return this.#promise;
    }

    resolve(value: T): void {
        if (this.#isResolved) return;
        this.#isResolved = true;
        this.#resolve(value);
    }

    reject(reason?: unknown): void {
        if (this.#isResolved) return;
        this.#isResolved = true;
        this.#isRejected = true;
        this.#reject(reason);
    }
}

function noop() {
    // do nothing
}
