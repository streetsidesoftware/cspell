/* eslint-disable @typescript-eslint/no-explicit-any */

import { errorWithPrefix, logWithPrefix } from './outputHelper';
import type { Logger } from './types';

export class PrefixLogger implements Logger {
    constructor(readonly prefix: string) {}

    readonly log = (message?: any, ...optionalParams: any[]): void => {
        logWithPrefix(this.prefix, message, ...optionalParams);
    };

    readonly error = (message?: any, ...optionalParams: any[]): void => {
        errorWithPrefix(this.prefix, message, ...optionalParams);
    };
}
