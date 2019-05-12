export declare const uniqueFn: typeof uniqueFilterFnGenerator;
export declare function uniqueFilterFnGenerator<T>(): (v: T) => boolean;
export declare function uniqueFilterFnGenerator<T, U>(extractFn: (v: T) => U): (v: T) => boolean;
export declare function unique<T>(src: T[]): T[];
export declare function clean<T extends Object>(src: T): T;
