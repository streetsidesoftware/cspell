import { vi } from 'vitest';

import { normalizeOutput } from './normalizeOutput.js';

export function spyOnConsole() {
    const con = {
        log: vi.spyOn(console, 'log').mockImplementation(() => undefined),
        error: vi.spyOn(console, 'error').mockImplementation(() => undefined),
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
        con.log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        con.error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    }

    function reset() {
        con.log.mockRestore();
        con.error.mockRestore();
    }

    return {
        consoleOutput,
        attach,
        reset,
    };
}
