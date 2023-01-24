import { normalizeOutput } from './normalizeOutput';

export function spyOnConsole() {
    const con = {
        log: jest.spyOn(console, 'log').mockImplementation(),
        error: jest.spyOn(console, 'error').mockImplementation(),
        consoleOutput,
        attach,
        reset,
    };

    function consoleOutput() {
        const _error = con.error.mock.calls.map((c) => c.join(',')).join('\n');
        const _log = con.log.mock.calls.map((c) => c.join(',')).join('\n');

        return {
            log: normalizeOutput(_log),
            error: normalizeOutput(_error),
        };
    }

    function attach() {
        reset();
        con.log = jest.spyOn(console, 'log').mockImplementation();
        con.error = jest.spyOn(console, 'error').mockImplementation();
    }

    function reset() {
        con.log.mockRestore();
        con.error.mockRestore();
    }

    return con;
}
