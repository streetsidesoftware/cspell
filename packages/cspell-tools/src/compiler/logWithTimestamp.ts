import type { Logger } from './logger.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logWithTimestamp: Logger = (message?: any, ...optionalParams: any[]) => {
    console.log(`${new Date().toISOString()} ${message}`, ...optionalParams);
};
