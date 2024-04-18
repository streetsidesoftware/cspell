/**
 * Escape Unicode Characters
 * @param text
 * @param regexp
 * @returns
 */
export function escapeUnicodeCode(text: string, regexp = /\p{M}/gu): string {
    return text.replace(regexp, replaceWithUnicode);
}

function replaceWithUnicode(substring: string): string {
    const start = 0x20;
    const end = 0x7a;
    let val = '';
    for (const char of substring) {
        const code = char.codePointAt(0) || 0;
        if (code >= start && code <= end) {
            val += char;
            continue;
        }
        for (let i = 0; i < char.length; i += 1) {
            // Use charCodeAt to get the value because JSON does not handle \u{10000} correctly.
            // eslint-disable-next-line unicorn/prefer-code-point
            const code = char.charCodeAt(i);
            const hex = code.toString(16).toUpperCase().padStart(4, '0');
            val += code < 256 ? '\\x' + hex.slice(-2) : hex.length === 4 ? '\\u' + hex : '\\u{' + hex + '}';
        }
    }
    return val;
}

/**
 * Converts a string of letters in ranges.
 *
 * `abcde` => `a-e`
 *
 * @param letters - sorted letters
 */

export function toRange(letters: string, minLength = 4): string {
    const chars: string[] = [];
    let begin = 0;
    let end = 0;
    let endChar = '';
    const minDiff = Math.max(minLength - 2, 1);

    function fill() {
        if (!(end - begin > 1)) return;
        if (end - begin > minDiff) {
            chars.push('-');
            return;
        }
        for (let code = begin + 1; code < end; code += 1) {
            chars.push(String.fromCodePoint(code));
        }
    }

    function pushRange() {
        fill();
        chars.push(endChar);
        endChar = '';
    }

    for (const letter of letters) {
        const code = letter.codePointAt(0) || 0;
        if (code - end === 1) {
            end = code;
            endChar = letter;
            continue;
        }
        pushRange();
        chars.push(letter);
        begin = code;
        end = code;
    }

    pushRange();

    return chars.join('');
}

export function removeAccents(text: string): string {
    return removeLooseAccents(text.normalize('NFD'));
}

export function removeLooseAccents(text: string): string {
    return text.replaceAll(/\p{M}/gu, '');
}
