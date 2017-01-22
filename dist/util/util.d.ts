export declare function asPromise<T>(thenable: {
    then(fnOnFulfil: (value: T) => T | Promise<T> | void, fnOnReject?: (reason?: any) => any): any;
}): Promise<T>;
