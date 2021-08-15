/* eslint-disable @typescript-eslint/no-explicit-any */

type Console = typeof console;
export interface Logger {
    log: Console['log'];
    warn: Console['warn'];
    error: Console['error'];
}

let _logger: Logger = console;

/**
 * See `Console.error`
 */
export function logError(...args: any[]): void {
    _logger.error(...args);
}

/**
 * See `Console.warn`
 */
export function logWarning(...args: any[]): void {
    _logger.warn(...args);
}

/**
 * See `Console.log`
 */
export function log(...args: any[]): void {
    _logger.log(...args);
}

/**
 * Set the global cspell-lib logger
 * @param logger - a logger like `console`
 * @returns the old logger.
 */
export function setLogger(logger: Logger): Logger {
    const oldLogger = _logger;
    _logger = logger;
    return oldLogger;
}

/**
 * Get the current cspell-lib logger.
 * @returns the current logger.
 */
export function getLogger(): Logger {
    return _logger;
}
