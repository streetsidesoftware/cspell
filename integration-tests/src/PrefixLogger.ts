/* eslint-disable @typescript-eslint/no-explicit-any */

import { errorWithPrefix, logWithPrefix, outputWithPrefix } from './outputHelper.js';
import type { Logger } from './types.js';

export class PrefixLogger implements Logger {
    constructor(readonly prefix: string) {}

    readonly output = (message: string, ...optionalParams: unknown[]): void => {
        outputWithPrefix(this.prefix, message, ...optionalParams);
    };

    readonly log = (message?: any, ...optionalParams: any[]): void => {
        logWithPrefix(this.prefix, message, ...optionalParams);
    };

    readonly error = (message?: any, ...optionalParams: any[]): void => {
        errorWithPrefix(this.prefix, message, ...optionalParams);
    };
}
