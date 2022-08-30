/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logger } from './types';
import { logWithPrefix, errorWithPrefix } from './outputHelper';

export class PrefixLogger implements Logger {
    constructor(readonly prefix: string) {}

    readonly log = (message?: any, ...optionalParams: any[]): void => {
        logWithPrefix(this.prefix, message, ...optionalParams);
    };

    readonly error = (message?: any, ...optionalParams: any[]): void => {
        errorWithPrefix(this.prefix, message, ...optionalParams);
    };
}
