import { getLogger, log, logError, Logger, logWarning, setLogger } from './logger';

const logger: Logger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

const mockLogger = jest.mocked(logger);

describe('logger', () => {
    beforeEach(() => {
        mockLogger.log.mockClear();
        mockLogger.warn.mockClear();
        mockLogger.error.mockClear();
    });

    test('logError', () => {
        setLogger(logger);
        const msg = 'Error Message';
        logError(msg);
        expect(mockLogger.error).toHaveBeenCalledWith(msg);
    });

    test('logWarning', () => {
        setLogger(logger);
        const msg = 'Warning Message';
        logWarning(msg);
        expect(mockLogger.warn).toHaveBeenCalledWith(msg);
    });

    test('log', () => {
        setLogger(logger);
        const msg = 'Log Message';
        log(msg);
        expect(mockLogger.log).toHaveBeenCalledWith(msg);
    });

    test('setLogger', () => {
        setLogger(console);
        expect(getLogger()).toBe(console);
        expect(setLogger(logger)).toBe(console);
        expect(getLogger()).toBe(logger);
    });
});
