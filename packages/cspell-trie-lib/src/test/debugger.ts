import inspector from 'node:inspector';

import { setDebuggerAttached } from '../lib/utils/debugger.ts';

/**
 * Set the debug mode based on the inspector status or the provided value.
 * @param isDebugging - Optional boolean to explicitly set debug mode.
 * @returns the current debug mode.
 */
export function registerDebugMode(isDebugging?: boolean): boolean {
    isDebugging ??= !!inspector.url();
    return setDebuggerAttached(isDebugging);
}
