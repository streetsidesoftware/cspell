import { vi } from 'vitest';

import { normalizeOutput } from './normalizeOutput.js';

export function spyOnConsole(): {
    consoleOutput: () => {
        log: string;
        error: string;
    };
    attach: () => void;
    reset: () => void;
} {
    const con = {
        log: vi.spyOn(console, 'log').mockImplementation(() => undefined),
        error: vi.spyOn(console, 'error').mockImplementation(() => undefined),
        consoleOutput,
        attach,
        reset,
    };

    function consoleOutput(): {
        log: string;
        error: string;
    } {
        const _error = con.error.mock.calls.map((c) => c.join(',')).join('\n');
        const _log = con.log.mock.calls.map((c) => c.join(',')).join('\n');

        return {
            log: normalizeOutput(_log),
            error: normalizeOutput(_error),
        };
    }

    function attach(): void {
        reset();
        con.log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        con.error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    }

    function reset(): void {
        con.log.mockRestore();
        con.error.mockRestore();
    }

    return {
        consoleOutput,
        attach,
        reset,
    };
}
