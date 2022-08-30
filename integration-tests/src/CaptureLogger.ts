/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logger } from './types';
import { format } from 'util';

export class CaptureLogger implements Logger {
    readonly logs: string[] = [];
    readonly errors: string[] = [];

    readonly log = (message?: any, ...optionalParams: any[]): void => {
        this.logs.push(format(message, ...optionalParams));
    };

    readonly error = (message?: any, ...optionalParams: any[]): void => {
        this.errors.push(format(message, ...optionalParams));
    };
}
