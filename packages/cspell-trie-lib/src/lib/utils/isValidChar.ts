import assert from 'node:assert';

import { isValidUtf16Character } from './text.js';

export function isValidChar(char: string): boolean {
    return isValidUtf16Character(char);
}

export function assertIsValidChar(char: string, message?: string): asserts char is string {
    if (!isValidChar(char)) {
        assert(false, `${message} "${char}" ${formatCharCodes(char)}`);
    }
}

export function formatCharCodes(char: string): string {
    return (
        char
            // eslint-disable-next-line unicorn/prefer-spread
            .split('')
            // eslint-disable-next-line unicorn/prefer-code-point
            .map((c) => '0x' + c.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase())
            .join(':')
    );
}
