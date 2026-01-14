export class Resolver<TResult> {
    #isResolved: boolean = false;
    #resolve: ((value: TResult | Promise<TResult>) => void) | undefined;
    #reject: ((reason?: unknown) => void) | undefined;
    readonly promise: Promise<TResult>;

    constructor() {
        this.promise = new Promise<TResult>((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    get isResolved(): boolean {
        return this.#isResolved;
    }

    resolve(value: TResult | Promise<TResult>): void {
        if (this.#isResolved) return;
        this.#isResolved = true;
        this.#resolve?.(value);
    }

    reject(reason?: unknown): void {
        if (this.#isResolved) return;
        this.#isResolved = true;
        this.#reject?.(reason);
    }
}
