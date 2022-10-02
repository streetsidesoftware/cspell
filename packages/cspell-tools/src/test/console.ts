import { normalizeOutput } from './normalizeOutput';

export function spyOnConsole() {
    const log = jest.spyOn(console, 'log').mockImplementation();
    const error = jest.spyOn(console, 'error').mockImplementation();

    function consoleOutput() {
        const _error = error.mock.calls.map((c) => c.join(',')).join('\n');
        const _log = log.mock.calls.map((c) => c.join(',')).join('\n');

        return {
            log: normalizeOutput(_log),
            error: normalizeOutput(_error),
        };
    }

    return {
        log,
        error,
        consoleOutput,
    };
}
